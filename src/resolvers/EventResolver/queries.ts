import {Arg, Ctx, FieldResolver, Query, Resolver, Root} from "type-graphql";
import {ForbiddenError} from "apollo-server-errors";
import {EventEntity} from "../../entities/EventEntity";
import {Authenticated} from "../../decorators/Authenticated";
import {Inject, Service} from "typedi";
import {MembershipEntity} from "../../entities/MembershipEntity";
import {AuthenticatedContext} from "../../utils/context";
import {EntityManager} from "typeorm";
import {AuthenticationError} from "apollo-server";
import {JoinLinkEntity} from "../../entities/JoinTokenEntity";
import {EventLoader} from "../../dataloaders/EventEntity";
import {tokens} from "../../tokens";
import {JoinLinkLoader} from "../../dataloaders/TokenEntity";
import {MembershipLoader} from "../../dataloaders/MembershipEntity";
import {PendingMembershipEntity} from "../../entities/PendingMembershipEntity";
import {PendingMembershipLoader} from "../../dataloaders/PendingMembershipEntity";
import {RangeForm} from "../../entities/AvailabilityEntity";
import EventService from "../../services/EventService";
import {DateTime, Interval} from "luxon";

@Service()
@Resolver(() => EventEntity)
export default class EventQueries {
  constructor(
    private manager: EntityManager,
    private eventService: EventService,
    @Inject(tokens.EventLoader) private eventLoader: EventLoader,
    @Inject(tokens.MembershipLoader) private membershipLoader: MembershipLoader,
    @Inject(tokens.JoinLinkLoader) private joinLinkLoader: JoinLinkLoader,
    @Inject(tokens.PendingMembershipLoader) private  pendingMembershipLoader: PendingMembershipLoader
  ) {}

  @Authenticated()
  @Query(() => EventEntity, {
    description: "Get all events for authenticated user"
  })
  async event(
    @Arg('id') id: number,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<EventEntity | undefined> {
    const { email } = ctx;
    const isMember = await this.eventLoader.areMembers.load([id, email]);
    
    if(!isMember) {
      throw new ForbiddenError('You are not a member of that event');
    }
    
    return this.eventLoader.byIds.load(id);
  }
  
  @Query(() => EventEntity, {
    description: "Get event for join link"
  })
  async eventFromJoinLink(
    @Arg('key') key: string
  ): Promise<EventEntity> {
    const link = await this.manager.findOneOrFail(JoinLinkEntity, {
      relations: ['event'],
      where: { key }
    });
    
    if(!link) {
      throw new AuthenticationError('Cannot find join link');
    }
    
    return link.event;
  }
  
  @FieldResolver(() => [MembershipEntity])
  async admins(
    @Root() event: EventEntity
  ): Promise<MembershipEntity[]> {
    const members = await this.membershipLoader.membersByEventIds.load(event.id);
    return members.filter((member) => member.permissions.isAdmin);
  }
  
  @FieldResolver(() => [MembershipEntity])
  async memberships(
    @Root() event: EventEntity
  ): Promise<MembershipEntity[]> {
    return this.membershipLoader.membersByEventIds.load(event.id);
  }
  
  @FieldResolver(() => MembershipEntity)
  async user(
    @Root() event: EventEntity,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<MembershipEntity> {
    const members = await this.membershipLoader.membersByEventIds.load(event.id);
    return members.find((member) => member.email === ctx.email);
  }

  @Authenticated()
  @FieldResolver(() => String)
  async joinLink(
    @Root() event: EventEntity,
  ): Promise<string> {
    const joinLinks = await this.joinLinkLoader.byEventId.load(event.id);
    const joinLink = joinLinks[0];
    return joinLink.link;
  }
  
  @Authenticated()
  @FieldResolver(() => [PendingMembershipEntity])
  async pendingMemberships(
    @Root() event: EventEntity
  ): Promise<PendingMembershipEntity[]> {
    return this.pendingMembershipLoader.byEventIds.load(event.id);
  }
  
  @Authenticated()
  @FieldResolver(() => [RangeForm], {
    description: 'Calculation of all the intersections of availabilities with this event'
  })
  async availabilities (
    @Root() event: EventEntity,
    @Arg("start") start: Date,
    @Arg("end") end: Date
  ): Promise<RangeForm[]> {
    const intervalScope = Interval.fromDateTimes(DateTime.fromJSDate(start), DateTime.fromJSDate(end));
    const eventScope = event.intersection(intervalScope);
    const intervals = await this.eventService.calculateAvailabilities(event.id, eventScope);
    
    return intervals.map((interval) => RangeForm.fromInterval(interval));
  }
}
