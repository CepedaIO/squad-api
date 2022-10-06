import {Inject, Service} from "typedi";
import {Ctx, Field, FieldResolver, ObjectType, Query, Resolver} from "type-graphql";
import {InviteTokenEntity} from "../../entities/InviteTokenEntity";
import {EntityManager, In} from "typeorm";
import {tokens} from "../../tokens";
import {EventLoader} from "../../dataloaders/EventEntity";
import {AuthenticatedContext, Context} from "../../utils/context";
import {Authenticated} from "../../decorators/Authenticated";
import {InviteTokenLoader} from "../../dataloaders/TokenEntity";
import {EventEntity} from "../../entities/EventEntity";

@ObjectType()
class User {
  @Field()
  email: string;
}

@Service()
@Resolver(of => User)
export default class UserQueries {
  constructor(
    private manager: EntityManager,
    @Inject(tokens.EventLoader) private eventLoader: EventLoader,
    @Inject(tokens.InviteTokenLoader) private inviteLoader: InviteTokenLoader
  ) {}

  @Authenticated()
  @Query(() => User)
  user(
    @Ctx() ctx: AuthenticatedContext
  ) {
    const { email } = ctx;
    return Object.assign({}, new User(), { email });
  }
  
  @Authenticated()
  @FieldResolver(() => [InviteTokenEntity])
  async invites(
    @Ctx() ctx: AuthenticatedContext
  ) {
    const { email } = ctx;
    return this.inviteLoader.byEmails.load(email);
  }
  
  @Authenticated()
  @FieldResolver(() => [EventEntity])
  async events(
    @Ctx() ctx: AuthenticatedContext
  ) {
    const { email } = ctx;
    const events = await this.eventLoader.byEmails.load(email);
    
    return events;
  }
}
