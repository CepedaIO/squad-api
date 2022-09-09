import {Arg, Ctx, Mutation, Query, Resolver} from "type-graphql";
import {ForbiddenError} from "apollo-server-errors";
import {EventEntity} from "../../entities/EventEntity";
import {Authenticated} from "../../decorators/Authenticated";
import {Transaction} from "../../decorators/Transaction";
import {Service} from "typedi";
import {MembershipEntity} from "../../entities/MembershipEntity";
import {AvailabilityEntity} from "../../entities/AvailabilityEntity";
import {AuthenticatedContext} from "../../utils/context";
import CreateEventInput from "./CreateEventInput";
import {MembershipPermissionsEntity} from "../../entities/MembershipPermissionEntity";
import {EventSummary} from "./EventSummary";
import {SimpleResponse} from "../SimpleResponse";
import {EntityManager} from "typeorm";
import {MembershipService} from "../../services/MembershipService";
import {UserInputError} from "apollo-server";
import {InviteTokenEntity} from "../../entities/InviteTokenEntity";
import {DateTime} from "luxon";
import {appConfig} from "../../configs/app";
import {HTMLService} from "../../services/HTMLService";
import {providers} from "../../providers";
import {randomBytes} from "crypto";

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
    description: "Get the summaries of all actives events for user"
  })
  async getEventSummaries(
    @Ctx() ctx: AuthenticatedContext
  ): Promise<EventSummary[]> {
    const events = await this.manager.createQueryBuilder(EventEntity, 'e')
      .innerJoin('e.memberships', 'm', 'm.email = :email', { email: ctx.email })
      .innerJoinAndSelect('e.memberships', 'admin')
      .leftJoin('admin.permissions', 'p')
      .getMany();

    return events.map((event) => Object.assign(new EventSummary(), event, {
      admin: event.memberships[0],
      duration: event.duration
    }));
  }

  @Authenticated()
  @Query(() => [EventEntity], {
    description: "Get all events for authenticated user"
  })
  async getEvents(
    @Ctx() ctx: AuthenticatedContext
  ): Promise<EventEntity[]> {
    /**
     * TODO: Everyone needs permissions, no left join here
     */
    return this.manager.createQueryBuilder(EventEntity, 'e')
      .innerJoinAndSelect('e.memberships', 'm')
      .innerJoinAndSelect('m.availabilities', 'a')
      .innerJoinAndSelect('m.permissions', 'p')
      .where('m.email = :email', { email: ctx.email })
      .getMany();
  }

  @Authenticated()
  @Query(() => EventEntity, {
    description: "Get all events for authenticated user"
  })
  async getEvent(
    @Arg('id') id: number,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<EventEntity | undefined> {
    return this.manager.createQueryBuilder(EventEntity, 'e')
      .innerJoinAndSelect('e.memberships', 'm')
      .innerJoinAndSelect('m.availabilities', 'a')
      .innerJoinAndSelect('m.permissions', 'p')
      .where('m.email = :email', { email: ctx.email })
      .andWhere('e.id = :id', { id })
      .getOne();
  }

  @Authenticated()
  @Mutation(() => SimpleResponse, {
    description: 'Invite a user to this event'
  })
  async inviteUser(
    @Arg('id') id: number,
    @Arg('email') email: string,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<SimpleResponse> {
    const [fromIsMemberOfEvent, toIsMemberEvent] = await this.membershipService.isMemberOf(id, [ctx.email, email]);

    if(!fromIsMemberOfEvent) {
      throw new ForbiddenError('You are not a member of this event');
    }

    if(toIsMemberEvent) {
      throw new UserInputError(`${email} is already a member of this event`);
    }

    const event = await this.manager.findOneOrFail(EventEntity, { id });
    const invite = await this.manager.save(InviteTokenEntity, {
      email,
      event,
      key: randomBytes(16).toString('hex'),
      expiresOn: DateTime.now().plus({days: 3})
    });

    const emailer = providers.emailerFor(email);
    await emailer.sendMail({
      from: appConfig.fromNoReply,
      to: email,
      subject: 'You have been invited!',
      html: this.htmlService.invite(invite)
    })

    return {
      success: true,
      result: JSON.stringify({ id, email })
    };
  }
}
