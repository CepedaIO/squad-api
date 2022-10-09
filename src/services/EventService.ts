import {Inject, Service} from "typedi";
import {EntityManager} from "typeorm";
import {EventLoader} from "../dataloaders/EventEntity";
import {tokens} from "../tokens";
import {MembershipLoader} from "../dataloaders/MembershipEntity";
import {Interval} from "luxon";
import {AvailabilityUtils} from "../utils/shared-shim";

@Service()
export default class EventService {
  constructor(
    private manager: EntityManager,
    @Inject(tokens.EventLoader) private eventLoader: EventLoader,
    @Inject(tokens.MembershipLoader) private membershipLoader: MembershipLoader
  ) {}
  
  async calculateAvailabilities(eventId: number, scopes: Interval[]) {
    const memberships = await this.membershipLoader.membersByEventIds.load(eventId);
    
    return Interval.merge(memberships.reduce((intervals, membership) =>
      AvailabilityUtils.intersection(intervals, membership.availabilities)
    , scopes));
  }
}
