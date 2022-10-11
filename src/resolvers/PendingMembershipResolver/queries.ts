import {Inject, Service} from "typedi";
import {FieldResolver, Resolver, Root} from "type-graphql";
import {EntityManager} from "typeorm";
import {EventLoader} from "../../dataloaders/EventEntity";
import {Event} from "../../entities/Event";
import {InviteTokenLoader} from "../../dataloaders/TokenEntity";
import {PendingMembership} from "../../entities/PendingMembership";
import {tokens} from "../../utils/container";

@Service()
@Resolver(() => PendingMembership)
export default class PendingMembershipQueries {
  constructor(
    private manager: EntityManager,
    @Inject(tokens.InviteTokenLoader) private inviteLoader: InviteTokenLoader,
    @Inject(tokens.EventLoader) private eventLoader: EventLoader
  ) {}
  
  @FieldResolver(() => Event)
  event(
    @Root() membership: PendingMembership
  ): Promise<Event> {
    return this.eventLoader.byIds.load(membership.eventId);
  }
}
