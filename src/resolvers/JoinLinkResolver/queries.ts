import {Inject, Service} from "typedi";
import {Arg, FieldResolver, Query, Resolver, Root,} from "type-graphql";
import {EntityManager} from "typeorm";
import {EventLoader} from "../../dataloaders/EventEntity";
import {Event} from "../../entities/Event";
import {JoinLink} from "../../entities/JoinLink";
import {JoinLinkLoader} from "../../dataloaders/TokenEntity";
import {tokens} from "../../utils/container";

@Service()
@Resolver(() => JoinLink)
export default class JoinLinkQueries {
  constructor(
    private manager: EntityManager,
    @Inject(tokens.EventLoader) private eventLoader: EventLoader,
    @Inject(tokens.JoinLinkLoader) private joinLinkLoader: JoinLinkLoader
  ) {}
  
  @Query(() => JoinLink)
  async joinLink(
    @Arg('key') key: string
  ): Promise<JoinLink> {
    const joinLinks = await this.joinLinkLoader.byKeys.load(key);
    return joinLinks[0];
  }
  
  @FieldResolver(() => Event)
  event(
    @Root() joinLink: JoinLink
  ): Promise<Event> {
    return this.eventLoader.byIds.load(joinLink.eventId);
  }
}
