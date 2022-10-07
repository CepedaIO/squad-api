import {Inject, Service} from "typedi";
import {FieldResolver, Resolver, Root} from "type-graphql";
import {EntityManager} from "typeorm";
import {EventLoader} from "../../dataloaders/EventEntity";
import {tokens} from "../../tokens";
import {EventEntity} from "../../entities/EventEntity";
import {InviteTokenLoader} from "../../dataloaders/TokenEntity";
import {PendingMembershipEntity} from "../../entities/PendingMembershipEntity";

@Service()
@Resolver(() => PendingMembershipEntity)
export default class PendingMembershipQueries {
  constructor(
    private manager: EntityManager,
    @Inject(tokens.InviteTokenLoader) private inviteLoader: InviteTokenLoader,
    @Inject(tokens.EventLoader) private eventLoader: EventLoader
  ) {}
  
  @FieldResolver(() => EventEntity)
  event(
    @Root() membership: PendingMembershipEntity
  ): Promise<EventEntity> {
    return this.eventLoader.byIds.load(membership.eventId);
  }
}
