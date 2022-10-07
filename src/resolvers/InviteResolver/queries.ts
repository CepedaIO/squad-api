import {Inject, Service} from "typedi";
import {Arg, FieldResolver, Query, Resolver, Root} from "type-graphql";
import {InviteTokenEntity} from "../../entities/InviteTokenEntity";
import {EntityManager} from "typeorm";
import {EventLoader} from "../../dataloaders/EventEntity";
import {tokens} from "../../tokens";
import {EventEntity} from "../../entities/EventEntity";
import {InviteTokenLoader} from "../../dataloaders/TokenEntity";
import {ForbiddenError} from "apollo-server-errors";

@Service()
@Resolver(() => InviteTokenEntity)
export default class InviteTokenQueries {
  constructor(
    private manager: EntityManager,
    @Inject(tokens.InviteTokenLoader) private inviteLoader: InviteTokenLoader,
    @Inject(tokens.EventLoader) private eventLoader: EventLoader
  ) {}

  @Query(() => InviteTokenEntity)
  async invite(
    @Arg('uuid') uuid: string,
    @Arg('key') key: string
  ): Promise<InviteTokenEntity> {
    const invite = await this.inviteLoader.byUUIDs.load(uuid);
    
    if(!invite || invite.key !== key) {
      throw new ForbiddenError('Invalid invite token');
    }
    
    return invite;
  }
  
  @FieldResolver(() => EventEntity)
  event(
    @Root() invite: InviteTokenEntity
  ): Promise<EventEntity> {
    return this.eventLoader.byIds.load(invite.eventId);
  }
}
