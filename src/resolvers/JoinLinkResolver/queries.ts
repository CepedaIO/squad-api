import {Inject, Service} from "typedi";
import {Arg, FieldResolver, Query, Resolver, Root,} from "type-graphql";
import {EntityManager} from "typeorm";
import {EventLoader} from "../../dataloaders/EventEntity";
import {tokens} from "../../tokens";
import {EventEntity} from "../../entities/EventEntity";
import {JoinLinkEntity} from "../../entities/JoinTokenEntity";
import {JoinLinkLoader} from "../../dataloaders/TokenEntity";

@Service()
@Resolver(() => JoinLinkEntity)
export default class JoinLinkQueries {
  constructor(
    private manager: EntityManager,
    @Inject(tokens.EventLoader) private eventLoader: EventLoader,
    @Inject(tokens.JoinLinkLoader) private joinLinkLoader: JoinLinkLoader
  ) {}
  
  @Query(() => JoinLinkEntity)
  async joinLink(
    @Arg('key') key: string
  ): Promise<JoinLinkEntity> {
    const joinLinks = await this.joinLinkLoader.byKeys.load(key);
    return joinLinks[0];
  }
  
  @FieldResolver(() => EventEntity)
  event(
    @Root() joinLink: JoinLinkEntity
  ): Promise<EventEntity> {
    return this.eventLoader.byIds.load(joinLink.eventId);
  }
}
