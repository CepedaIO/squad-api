import {Arg, Ctx, Mutation, Query, Resolver} from "type-graphql";
import {EventEntity} from "../../entities/EventEntity";
import {Authenticated} from "../../decorators/Authenticated";
import {Transaction} from "../../decorators/Transaction";
import {Service} from "typedi";
import {Database} from "../../utils/typeorm";
import {MembershipEntity} from "../../entities/MembershipEntity";
import {AvailabilityEntity} from "../../entities/AvailabilityEntity";
import {AuthenticatedContext} from "../../utils/context";
import CreateEventInput from "./CreateEventInput";
import {MembershipPermissionsEntity} from "../../entities/MembershipPermissionEntity";
import {EventSummary} from "./EventSummary";

@Service()
@Resolver()
export default class EventResolver {
  constructor(
    private db: Database,
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
    const event = this.db.create(EventEntity, {
      ...payload,
      memberships: [
        this.db.create(MembershipEntity, {
          displayName: payload.displayName,
          email: ctx.email,
          permissions: this.db.create(MembershipPermissionsEntity, {
            isAdmin: true
          }),
          availabilities: payload.availabilities.map((form) =>
            this.db.create(AvailabilityEntity, form)
          )
        })
      ]
    });

    event.duration = payload.duration;

    return this.db.save(EventEntity, event);
  }

  @Authenticated()
  @Query(() => [EventSummary], {
    description: "Get the summaries of all actives events for user"
  })
  async getEventSummaries(
    @Ctx() ctx: AuthenticatedContext
  ): Promise<EventSummary[]> {
    const events = await this.db.qb(EventEntity, 'e')
      .innerJoin('e.memberships', 'm', 'm.eventId = e.id AND m.email = :email', { email: ctx.email })
      .innerJoinAndSelect('e.memberships', 'admin', 'admin.eventId = e.id')
      .leftJoin('admin.permissions', 'p', 'p.membershipId = admin.id')
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
    return this.db.qb(EventEntity, 'e')
      .innerJoinAndSelect('e.memberships', 'm', 'm.eventId = e.id')
      .innerJoinAndSelect('m.availabilities', 'a','a.membershipId = m.id')
      .innerJoinAndSelect('m.permissions', 'p', 'p.membershipId = m.id')
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
    return this.db.qb(EventEntity, 'e')
      .innerJoinAndSelect('e.memberships', 'm', 'm.eventId = e.id')
      .innerJoinAndSelect('m.availabilities', 'a','a.membershipId = m.id')
      .innerJoinAndSelect('m.permissions', 'p', 'p.membershipId = m.id')
      .where('m.email = :email', { email: ctx.email })
      .andWhere('e.id = :id', { id })
      .getOne();
  }
}
