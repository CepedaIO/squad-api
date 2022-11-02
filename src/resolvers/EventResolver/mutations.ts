import {Inject, Service} from "typedi";
import {Arg, Ctx, Mutation, Resolver} from "type-graphql";
import {EntityManager} from "typeorm";
import {MembershipService} from "../../services/MembershipService";
import {HTMLService} from "../../services/HTMLService";
import {TokenService} from "../../services/TokenService";
import {Authenticated} from "../../decorators/Authenticated";
import {Event, EventAvailability, EventResolution} from "../../entities/Event";
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
import {appConfig} from "../../configs/app";
import {JoinLink} from "../../entities/JoinLink";
import {tokens} from "../../utils/container";
import {EventLoader} from "../../dataloaders/EventEntity";
import {Transporter} from "nodemailer";

@Service()
@Resolver()
export default class EventMutations {
  constructor(
    private manager: EntityManager,
    private membershipService: MembershipService,
    private htmlService: HTMLService,
    private tokenService: TokenService,
    @Inject(tokens.EventLoader) private eventLoader: EventLoader,
    @Inject(tokens.Transporter) private emailer: Transporter
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
    description: 'Accepts invite and adds user to event'
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
    
    await this.manager.save(Membership, {
      email: invite.email,
      displayName,
      event: invite.event,
      availabilities: availabilities.map((form) => this.manager.create(MemberAvailability, form)),
      permissions: this.manager.create(MembershipPermission, { isAdmin: false })
    });
  
    await this.manager.delete(InviteToken, pick(invite, 'id'));
    
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
    
    await this.emailer.sendMail({
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
  @Mutation(() => SimpleResponse, {
    description: 'Accept and publish the final times for an event'
  })
  async publishEventTime(
    @Arg('eventId') eventId: number,
    @Arg('start') start: DateTime,
    @Arg('end') end: DateTime,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<SimpleResponse> {
    const isAdmin = await this.eventLoader.areAdmins.load([eventId, ctx.email]);
    
    if(!isAdmin) {
      throw new ForbiddenError('Must be admin of that event');
    }
    
    const resolution = await this.eventLoader.getResolutions.load(eventId);
    
    if(resolution) {
      throw new UserInputError('Resolution already exists for that event');
    }
    
    await this.manager.save(EventResolution, this.manager.create(EventResolution, {
      eventId,
      start,
      end
    }));
    
    return {
      success: true,
      result: 'Resolution for event saved!'
    };
  }
}
