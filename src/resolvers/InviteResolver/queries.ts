import {Inject, Service} from "typedi";
import {Arg, Ctx, Query, Resolver,} from "type-graphql";
import {InviteTokenEntity} from "../../entities/InviteTokenEntity";
import {EntityManager} from "typeorm";
import {Context} from "../../utils/context";
import {EventLoader} from "../../dataloaders/EventEntity";
import {tokens} from "../../tokens";

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
      relations: ['event'],
      where: { uuid, key}
    });
  }
}
