import {Service} from "typedi";
import {Arg, Ctx, Mutation, Resolver} from "type-graphql";
import {EntityManager} from "typeorm";
import {MembershipService} from "../../services/MembershipService";
import {HTMLService} from "../../services/HTMLService";
import {TokenService} from "../../services/TokenService";
import {Authenticated} from "../../decorators/Authenticated";
import {Event, EventAvailability} from "../../entities/Event";
import {AcceptEventInput, CreateEventInput, InviteMemberInput} from "./models";
import {AuthenticatedContext, Context} from "../../utils/context";
import {Membership} from "../../entities/Membership";
import {MembershipPermission} from "../../entities/MembershipPermission";
import {MemberAvailability} from "../../entities/MemberAvailability";
import {SimpleResponse} from "../SimpleResponse";
import {InviteToken} from "../../entities/InviteToken";
import {AuthenticationError, UserInputError} from "apollo-server";
import {pick} from "lodash";
import {ForbiddenError} from "apollo-server-errors";
import {createKey} from "../../utils/bag";
import {DateTime} from "luxon";
import {providers} from "../../providers";
import {appConfig} from "../../configs/app";
import {JoinLink} from "../../entities/JoinLink";

@Service()
@Resolver()
export default class EventMutations {
  constructor(
    private manager: EntityManager,
    private membershipService: MembershipService,
    private htmlService: HTMLService,
    private tokenService: TokenService
  ) {}
  
  @Authenticated()
  @Mutation(() => Event, {
    description: 'Create an event senora'
  })
  async createEvent(
    @Arg("payload", () => CreateEventInput) payload: CreateEventInput,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<Event> {
    const event = this.manager.create(Event, {
      ...payload,
      availabilities: payload.eventAvailabilities.map((form) =>
        this.manager.create(EventAvailability, form)
      ),
      memberships: [
        this.manager.create(Membership, {
          displayName: payload.displayName,
          email: ctx.email,
          permissions: this.manager.create(MembershipPermission, {
            isAdmin: true
          }),
          availabilities: payload.availabilities.map((form) =>
            this.manager.create(MemberAvailability, form)
          )
        })
      ],
      joinLinks: [
        this.manager.create(JoinLink, {
          key: createKey(8),
          message: payload.description,
        })
      ]
    });
  
    event.duration = payload.duration;
    return this.manager.save(Event, event);
  }
  
  @Mutation(() => SimpleResponse, {
    description: 'Adds user to event and returns authenticated session'
  })
  async acceptInvite(
    @Arg('payload') payload: AcceptEventInput,
    @Ctx() ctx: Context
  ): Promise<SimpleResponse> {
    const { uuid, key, displayName, availabilities } = payload;
    
    const invite = await this.manager.findOne(InviteToken, { uuid, key }, {
      relations: ['event']
    });
    
    if(!invite) {
      throw new AuthenticationError('Was unable to join event');
    }
    
    await this.manager.delete(InviteToken, pick(invite, 'id'));
    await this.manager.save(Membership, {
      email: invite.email,
      displayName,
      event: invite.event,
      availabilities: availabilities.map((form) => this.manager.create(MemberAvailability, form)),
      permissions: this.manager.create(MembershipPermission, { isAdmin: false })
    });
    
    return {
      success: true,
      result: `${invite.email} has joined the event!`
    };
  }
  
  @Authenticated()
  @Mutation(() => SimpleResponse, {
    description: 'Invite a member to this event'
  })
  async inviteMember(
    @Arg('payload') payload: InviteMemberInput,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<SimpleResponse> {
    const { id, email, message } = payload;
    
    const pending = await this.manager.findOne(InviteToken, {
      where: {
        email,
        event: { id }
      }
    });
    
    if(pending && !pending.expired) {
      throw new UserInputError(`${email} already has a pending invite`)
    } else if(pending) {
      await this.manager.delete(InviteToken, pending);
    }
    
    const [fromMembership, toMembership] = await this.membershipService.membershipsFor(id, [ctx.email, email]);
    
    if(!fromMembership) {
      throw new ForbiddenError('You are not a member of this event');
    }
    
    if(toMembership) {
      throw new UserInputError(`${email} is already a member of this event`);
    }
    
    const event = await this.manager.findOneOrFail(Event, { id });
    const invite = await this.manager.save(InviteToken, {
      email,
      event,
      from: ctx.email,
      key: createKey(),
      expiresOn: DateTime.now().plus({days: 3})
    });
    
    const emailer = providers.emailerFor(email);
    await emailer.sendMail({
      from: appConfig.fromNoReply,
      to: email,
      subject: 'You have been invited!',
      html: this.htmlService.invite(invite, fromMembership.displayName, message)
    })
    
    return {
      success: true,
      result: `Invite sent to ${email}`
    };
  }
  
  @Authenticated()
  @Mutation(() => JoinLink, {
    description: 'Create a join link for anyone to join the event with'
  })
  async createJoinLink(
    @Arg('eventId') eventId: number,
    @Arg('message') message: string,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<JoinLink> {
    const { email } = ctx;
    const isAdmin = await this.membershipService.isAdmin(eventId, email);
    
    if(!isAdmin) {
      throw new ForbiddenError('You must be the admin of this event');
    }
    
    const event = await this.manager.findOneOrFail(Event, {
      id: eventId
    });
    return this.tokenService.createJoinLink(event, message);
  }
  
  @Authenticated()
  @Mutation(() => SimpleResponse, {
    description: ''
  })
  async deleteJoinToken(
    @Arg('uuid') uuid: string,
    @Arg('key') key: string,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<SimpleResponse> {
    const token = await this.manager.findOne(JoinLink, { key });
    if(!token) {
      throw new UserInputError(`Invalid token`);
    }
    
    await this.manager.delete(JoinLink, token);
    
    return {
      success: true,
      result: 'The link is no more...'
    };
  }
}
