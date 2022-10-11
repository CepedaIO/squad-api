import {Arg, Ctx, FieldResolver, Query, Resolver, Root} from "type-graphql";
import {ForbiddenError} from "apollo-server-errors";
import {Event} from "../../entities/Event";
import {Authenticated} from "../../decorators/Authenticated";
import {Inject, Service} from "typedi";
import {Membership} from "../../entities/Membership";
import {AuthenticatedContext} from "../../utils/context";
import {EntityManager} from "typeorm";
import {AuthenticationError} from "apollo-server";
import {JoinLink} from "../../entities/JoinLink";
import {EventLoader} from "../../dataloaders/EventEntity";
import {JoinLinkLoader} from "../../dataloaders/TokenEntity";
import {MembershipLoader} from "../../dataloaders/MembershipEntity";
import {PendingMembership} from "../../entities/PendingMembership";
import {PendingMembershipLoader} from "../../dataloaders/PendingMembershipEntity";
import EventService from "../../services/EventService";
import {DateTime, Interval} from "luxon";
import {RangeForm} from "../GeneralResolver/models";
import {tokens} from "../../utils/container";

@Service()
@Resolver(() => Event)
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
  @Query(() => Event, {
    description: "Get all events for authenticated user"
  })
  async event(
    @Arg('id') id: number,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<Event | undefined> {
    const { email } = ctx;
    const isMember = await this.eventLoader.areMembers.load([id, email]);
    
    if(!isMember) {
      throw new ForbiddenError('You are not a member of that event');
    }
    
    return this.eventLoader.byIds.load(id);
  }
  
  @Query(() => Event, {
    description: "Get event for join link"
  })
  async eventFromJoinLink(
    @Arg('key') key: string
  ): Promise<Event> {
    const link = await this.manager.findOneOrFail(JoinLink, {
      relations: ['event'],
      where: { key }
    });
    
    if(!link) {
      throw new AuthenticationError('Cannot find join link');
    }
    
    return link.event;
  }
  
  @FieldResolver(() => [Membership])
  async admins(
    @Root() event: Event
  ): Promise<Membership[]> {
    const members = await this.membershipLoader.membersByEventIds.load(event.id);
    return members.filter((member) => member.permissions.isAdmin);
  }
  
  @FieldResolver(() => [Membership])
  async memberships(
    @Root() event: Event
  ): Promise<Membership[]> {
    return this.membershipLoader.membersByEventIds.load(event.id);
  }
  
  @FieldResolver(() => Membership)
  async user(
    @Root() event: Event,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<Membership> {
    const members = await this.membershipLoader.membersByEventIds.load(event.id);
    return members.find((member) => member.email === ctx.email);
  }

  @Authenticated()
  @FieldResolver(() => String)
  async joinLink(
    @Root() event: Event,
  ): Promise<string> {
    const joinLinks = await this.joinLinkLoader.byEventId.load(event.id);
    const joinLink = joinLinks[0];
    return joinLink.link;
  }
  
  @Authenticated()
  @FieldResolver(() => [PendingMembership])
  async pendingMemberships(
    @Root() event: Event
  ): Promise<PendingMembership[]> {
    return this.pendingMembershipLoader.byEventIds.load(event.id);
  }
}
