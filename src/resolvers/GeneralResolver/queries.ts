import {Inject, Service} from "typedi";
import {Arg, Ctx, Query, Resolver} from "type-graphql";
import {EntityManager} from "typeorm";
import EventService from "../../services/EventService";
import {EventLoader} from "../../dataloaders/EventEntity";
import {MembershipLoader} from "../../dataloaders/MembershipEntity";
import {AuthenticatedContext} from "../../utils/context";
import {Authenticated} from "../../decorators/Authenticated";
import {ForbiddenError} from "apollo-server-errors";
import {RangeForm} from "./models";
import {tokens} from "../../utils/container";

@Service()
@Resolver()
export default class GeneralQueries {
  constructor(
    private manager: EntityManager,
    private eventService: EventService,
    @Inject(tokens.EventLoader) private eventLoader: EventLoader,
    @Inject(tokens.MembershipLoader) private membershipLoader: MembershipLoader,
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
  
    const intervals = await this.eventService.calculateEventMemberIntervals(eventId, start, end);
    return intervals.map((interval) => RangeForm.fromInterval(interval));
  }
}
