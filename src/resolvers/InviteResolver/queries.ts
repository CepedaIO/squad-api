import {Inject, Service} from "typedi";
import {Arg, Ctx, FieldResolver, Query, Resolver, Root,} from "type-graphql";
import {InviteTokenEntity} from "../../entities/InviteTokenEntity";
import {EntityManager} from "typeorm";
import {EventLoader} from "../../dataloaders/EventEntity";
import {tokens} from "../../tokens";
import {EventEntity} from "../../entities/EventEntity";

@Service()
@Resolver(of => InviteTokenEntity)
export default class TokenQueries {
  constructor(
    private manager: EntityManager,
    @Inject(tokens.EventLoader) private eventLoader: EventLoader
  ) {}

  @Query(() => InviteTokenEntity)
  invite(
    @Arg('uuid') uuid: string,
    @Arg('key') key: string
  ): Promise<InviteTokenEntity> {
    return this.manager.findOneOrFail(InviteTokenEntity, {
      where: { uuid, key }
    });
  }
  
  @FieldResolver(() => EventEntity)
  event(
    @Root() invite: InviteTokenEntity
  ): Promise<EventEntity> {
    return this.eventLoader.byIds.load(invite.eventId);
  }
}
