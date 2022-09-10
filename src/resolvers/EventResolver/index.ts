import {Arg, Ctx, Mutation, Query, Resolver} from "type-graphql";
import {ForbiddenError} from "apollo-server-errors";
import {EventEntity} from "../../entities/EventEntity";
import {Authenticated} from "../../decorators/Authenticated";
import {Transaction} from "../../decorators/Transaction";
import {Service} from "typedi";
import {MembershipEntity} from "../../entities/MembershipEntity";
import {AvailabilityEntity} from "../../entities/AvailabilityEntity";
import {AuthenticatedContext, Context} from "../../utils/context";
import {MembershipPermissionsEntity} from "../../entities/MembershipPermissionEntity";
import {SimpleResponse} from "../SimpleResponse";
import {EntityManager} from "typeorm";
import {MembershipService} from "../../services/MembershipService";
import {UserInputError, AuthenticationError} from "apollo-server";
import {InviteTokenEntity} from "../../entities/InviteTokenEntity";
import {DateTime} from "luxon";
import {appConfig} from "../../configs/app";
import {HTMLService} from "../../services/HTMLService";
import {providers} from "../../providers";
import {createKey} from "../../utils/bag";
import {AcceptInviteInput, CreateEventInput, InviteMemberInput} from "./inputs";
import {EventSummary} from "./outputs";
import {pick} from "lodash";

@Service()
@Resolver()
export default class EventResolver {
  constructor(
    private manager: EntityManager,
    private membershipService: MembershipService,
    private htmlService: HTMLService
  ) {}

  @Authenticated()
  @Transaction()
  @Mutation(() => EventEntity, {
    description: 'Create an event'
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
      ]
    });

    event.duration = payload.duration;

    return this.manager.save(EventEntity, event);
  }

  @Authenticated()
  @Query(() => [EventSummary], {
    description: "Get the summaries of all active events for user"
  })
  async getEventSummaries(
    @Ctx() ctx: AuthenticatedContext
  ): Promise<EventSummary[]> {
    const events = await this.manager.createQueryBuilder(EventEntity, 'e')
      .innerJoin('e.memberships', 'm', 'm.email = :email', { email: ctx.email })
      .innerJoinAndSelect('e.memberships', 'admin')
      .innerJoinAndSelect('admin.permissions', 'p')
      .getMany();

    return events.map((event) => Object.assign(new EventSummary(), event, {
      admin: event.memberships[0],
      memberCount: event.memberships.length,
      duration: event.duration
    }));
  }
  
  @Authenticated()
  @Query(() => EventSummary, {
    description: "Get the summary of a specific event"
  })
  async getEventSummaryFor(
    @Arg('id') id: number,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<EventSummary> {
    const event = await this.manager.createQueryBuilder(EventEntity, 'e')
      .innerJoin('e.memberships', 'm', 'm.email = :email', { email: ctx.email })
      .innerJoinAndSelect('e.memberships', 'admin')
      .leftJoin('admin.permissions', 'p')
      .where('e.id = :id', { id })
      .getOne();
    
    if(!event) {
      throw new AuthenticationError('You cannot get the summary of this event');
    }
    
    return Object.assign(new EventSummary(), event, {
      admin: event.memberships[0],
      duration: event.duration
    })
  }

  @Authenticated()
  @Query(() => [EventEntity], {
    description: "Get all events for authenticated user"
  })
  async getEvents(
    @Ctx() ctx: AuthenticatedContext
  ): Promise<EventEntity[]> {
    const eventIds = await this.membershipService.eventIdsFor([ ctx.email ]);
    return this.manager.findByIds(EventEntity, eventIds);
  }

  @Authenticated()
  @Query(() => EventEntity, {
    description: "Get all events for authenticated user"
  })
  async getEvent(
    @Arg('id') id: number,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<EventEntity | undefined> {
    return this.manager.findOne(EventEntity, { id });
  }
  
  @Mutation(() => SimpleResponse, {
    description: 'Adds user to event and returns authenticated session'
  })
  async acceptInvite(
    @Arg('payload') payload: AcceptInviteInput,
    @Ctx() ctx: Context
  ): Promise<SimpleResponse> {
    const { uuid, key, eventId, displayName, availabilities } = payload;

    const invite = await this.manager.findOne(InviteTokenEntity, {
      uuid, key, event: { id: eventId }
    }, {
      relations: ['event']
    });

    if(!invite) {
      throw new AuthenticationError('You cannot invite anyone to that event');
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
}
