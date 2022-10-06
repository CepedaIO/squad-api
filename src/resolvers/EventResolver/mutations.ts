import {Service} from "typedi";
import {Arg, Ctx, Mutation, Resolver} from "type-graphql";
import {EntityManager} from "typeorm";
import {MembershipService} from "../../services/MembershipService";
import {HTMLService} from "../../services/HTMLService";
import {TokenService} from "../../services/TokenService";
import {Authenticated} from "../../decorators/Authenticated";
import {EventEntity} from "../../entities/EventEntity";
import {AcceptEventInput, CreateEventInput, InviteMemberInput} from "./inputs";
import {AuthenticatedContext, Context} from "../../utils/context";
import {MembershipEntity} from "../../entities/MembershipEntity";
import {MembershipPermissionsEntity} from "../../entities/MembershipPermissionEntity";
import {AvailabilityEntity} from "../../entities/AvailabilityEntity";
import {SimpleResponse} from "../SimpleResponse";
import {InviteTokenEntity} from "../../entities/InviteTokenEntity";
import {AuthenticationError, UserInputError} from "apollo-server";
import {pick} from "lodash";
import {ForbiddenError} from "apollo-server-errors";
import {createKey} from "../../utils/bag";
import {DateTime} from "luxon";
import {providers} from "../../providers";
import {appConfig} from "../../configs/app";
import {JoinLinkEntity} from "../../entities/JoinTokenEntity";

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
  @Mutation(() => EventEntity, {
    description: 'Create an event senora'
  })
  async createEvent(
    @Arg("payload", () => CreateEventInput) payload: CreateEventInput,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<EventEntity> {
    const event = this.manager.create(EventEntity, {
      ...payload,
      memberships: [
        this.manager.create(MembershipEntity, {
          displayName: payload.displayName,
          email: ctx.email,
          permissions: this.manager.create(MembershipPermissionsEntity, {
            isAdmin: true
          }),
          availabilities: payload.availabilities.map((form) =>
            this.manager.create(AvailabilityEntity, form)
          )
        })
      ],
      joinLinks: [
        this.manager.create(JoinLinkEntity, {
          key: createKey(),
          message: payload.description,
        })
      ]
    });
  
    event.duration = payload.duration;
    return this.manager.save(EventEntity, event);
  }
  
  @Mutation(() => SimpleResponse, {
    description: 'Adds user to event and returns authenticated session'
  })
  async acceptInvite(
    @Arg('payload') payload: AcceptEventInput,
    @Ctx() ctx: Context
  ): Promise<SimpleResponse> {
    const { uuid, key, displayName, availabilities } = payload;
    
    const invite = await this.manager.findOne(InviteTokenEntity, { uuid, key }, {
      relations: ['event']
    });
    
    if(!invite) {
      throw new AuthenticationError('Was unable to join event');
    }
    
    await this.manager.delete(InviteTokenEntity, pick(invite, 'id'));
    await this.manager.save(MembershipEntity, {
      email: invite.email,
      displayName,
      event: invite.event,
      availabilities: availabilities.map((form) => this.manager.create(AvailabilityEntity, form)),
      permissions: this.manager.create(MembershipPermissionsEntity, { isAdmin: false })
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
    
    const pending = await this.manager.findOne(InviteTokenEntity, {
      where: {
        email,
        event: { id }
      }
    });
    
    if(pending && !pending.expired) {
      throw new UserInputError(`${email} already has a pending invite`)
    } else if(pending) {
      await this.manager.delete(InviteTokenEntity, pending);
    }
    
    const [fromMembership, toMembership] = await this.membershipService.membershipsFor(id, [ctx.email, email]);
    
    if(!fromMembership) {
      throw new ForbiddenError('You are not a member of this event');
    }
    
    if(toMembership) {
      throw new UserInputError(`${email} is already a member of this event`);
    }
    
    const event = await this.manager.findOneOrFail(EventEntity, { id });
    const invite = await this.manager.save(InviteTokenEntity, {
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
  @Mutation(() => JoinLinkEntity, {
    description: 'Create a join link for anyone to join the event with'
  })
  async createJoinLink(
    @Arg('eventId') eventId: number,
    @Arg('message') message: string,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<JoinLinkEntity> {
    const { email } = ctx;
    const isAdmin = await this.membershipService.isAdmin(eventId, email);
    
    if(!isAdmin) {
      throw new ForbiddenError('You must be the admin of this event');
    }
    
    const event = await this.manager.findOneOrFail(EventEntity, {
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
    const token = await this.manager.findOne(JoinLinkEntity, { uuid, key });
    if(!token) {
      throw new UserInputError(`Invalid token`);
    }
    
    await this.manager.delete(JoinLinkEntity, token);
    
    return {
      success: true,
      result: 'The link is no more...'
    };
  }
}
