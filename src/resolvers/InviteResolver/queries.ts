import {Inject, Service} from "typedi";
import {Arg, FieldResolver, Query, Resolver, Root} from "type-graphql";
import {InviteToken} from "../../entities/InviteToken";
import {EntityManager} from "typeorm";
import {EventLoader} from "../../dataloaders/EventEntity";
import {Event} from "../../entities/Event";
import {InviteTokenLoader} from "../../dataloaders/TokenEntity";
import {ForbiddenError} from "apollo-server-errors";
import {tokens} from "../../utils/container";

@Service()
@Resolver(() => InviteToken)
export default class InviteTokenQueries {
  constructor(
    private manager: EntityManager,
    @Inject(tokens.InviteTokenLoader) private inviteLoader: InviteTokenLoader,
    @Inject(tokens.EventLoader) private eventLoader: EventLoader
  ) {}

  @Query(() => InviteToken)
  async invite(
    @Arg('uuid') uuid: string,
    @Arg('key') key: string
  ): Promise<InviteToken> {
    const invite = await this.inviteLoader.byUUIDs.load(uuid);
    
    if(!invite || invite.key !== key) {
      throw new ForbiddenError('Invalid invite token');
    }
    
    return invite;
  }
  
  @FieldResolver(() => Event)
  event(
    @Root() invite: InviteToken
  ): Promise<Event> {
    return this.eventLoader.byIds.load(invite.eventId);
  }
}
