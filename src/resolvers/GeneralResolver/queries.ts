import {Inject, Service} from "typedi";
import {Arg, Ctx, Query, Resolver} from "type-graphql";
import {EntityManager} from "typeorm";
import EventService from "../../services/EventService";
import {tokens} from "../../tokens";
import {EventLoader} from "../../dataloaders/EventEntity";
import {MembershipLoader} from "../../dataloaders/MembershipEntity";
import {JoinLinkLoader} from "../../dataloaders/TokenEntity";
import {PendingMembershipLoader} from "../../dataloaders/PendingMembershipEntity";
import {RangeForm} from "../../entities/AvailabilityEntity";
import {AuthenticatedContext} from "../../utils/context";
import {Authenticated} from "../../decorators/Authenticated";
import {ForbiddenError} from "apollo-server-errors";
import {Interval} from "luxon";

@Service()
@Resolver()
export default class GeneralQueries {
  constructor(
    private manager: EntityManager,
    private eventService: EventService,
    @Inject(tokens.EventLoader) private eventLoader: EventLoader,
    @Inject(tokens.MembershipLoader) private membershipLoader: MembershipLoader,
    @Inject(tokens.JoinLinkLoader) private joinLinkLoader: JoinLinkLoader,
    @Inject(tokens.PendingMembershipLoader) private pendingMembershipLoader: PendingMembershipLoader
  ) { }
  
  @Authenticated()
  @Query(() => [RangeForm])
  async availabilityForEvent(
    @Arg('eventId') eventId: number,
    @Arg('start') start: Date,
    @Arg('end') end: Date,
    @Ctx() ctx: AuthenticatedContext
  ) {
    const isMember = await this.eventLoader.areMembers.load([eventId, ctx.email]);
    if(!isMember) throw new ForbiddenError('You are not a member of that event');
    
    const event = await this.eventLoader.byIds.load(eventId);
    const scope = event.intersection(Interval.fromDateTimes(start, end));
    return this.eventService.calculateAvailabilities(eventId, scope);
  }
}
