import {Inject, Service} from "typedi";
import {EntityManager} from "typeorm";
import {EventLoader} from "../dataloaders/EventEntity";
import {MembershipLoader} from "../dataloaders/MembershipEntity";
import {Duration, Interval} from "luxon";
import {AvailabilityUtils} from "../utils/shared-shim";
import {tokens} from "../utils/container";
import {IAvailabilityBase} from "event-matcher-shared";

@Service()
export default class EventService {
  constructor(
    private manager: EntityManager,
    @Inject(tokens.EventLoader) private eventLoader: EventLoader,
    @Inject(tokens.MembershipLoader) private membershipLoader: MembershipLoader
  ) {}
  
  async calculateEventMemberIntervals(eventId: number, start: Date, end: Date) {
    const memberships = await this.membershipLoader.membersByEventIds.load(eventId);
    const memberAvailabilities = memberships.map((membership) => membership.availabilities.map((availability) => ({ start: availability.start, end: availability.end })));
    const event = await this.eventLoader.byIds.load(eventId);
    const scope = Interval.fromDateTimes(start, end);
    const duration = Duration.fromDurationLike(event.duration);
    const eventIntervals = event.anytime ? [scope] : AvailabilityUtils.intervalsFor(duration, scope, event.availabilities);
    
    const membershipIntervals = this.getAllMembershipIntervals(duration, eventIntervals, memberAvailabilities);
    return this.reduceMembershipIntervals(duration, membershipIntervals);
  }
  
  reduceMembershipIntervals(duration: Duration, membershipIntervals: Interval[][]): Interval[] {
    const startMembership = membershipIntervals.pop();
    return membershipIntervals.reduce((intervals, membershipIntervals) => {
      return intervals.reduce((finalIntervals, interval) => {
        const subIntervals = AvailabilityUtils.intervalsFor(duration, interval, membershipIntervals)
        return finalIntervals.concat(subIntervals)
      }, []);
    }, startMembership)
  }

  getAllMembershipIntervals(duration: Duration, eventScopes: Interval[], memberAvailabilities: IAvailabilityBase[][]): Interval[][] {
    const memberIntervals = Interval.merge(eventScopes).reduce((intervals, eventScope) => {
      const subIntervals = memberAvailabilities.map((availabilities) =>
        AvailabilityUtils.intervalsFor(duration, eventScope, availabilities)
      );

      return intervals.map((memberInterval, index) => memberInterval.concat(subIntervals[index]));
    }, memberAvailabilities.map(() => []))
  
    return memberIntervals.map((memberIntervals) => Interval.merge(memberIntervals))
  }
}
