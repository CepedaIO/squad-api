import {Inject, Service} from "typedi";
import {Ctx, Field, FieldResolver, ObjectType, Query, Resolver} from "type-graphql";
import {InviteToken} from "../../entities/InviteToken";
import {EntityManager} from "typeorm";
import {EventLoader} from "../../dataloaders/EventEntity";
import {AuthenticatedContext} from "../../utils/context";
import {Authenticated} from "../../decorators/Authenticated";
import {InviteTokenLoader} from "../../dataloaders/TokenEntity";
import {Event} from "../../entities/Event";
import {PendingMembership} from "../../entities/PendingMembership";
import {PendingMembershipLoader} from "../../dataloaders/PendingMembershipEntity";
import {tokens} from "../../utils/container";

@ObjectType()
class User {
  @Field()
  email: string;
}

@Service()
@Resolver(() => User)
export default class UserQueries {
  constructor(
    private manager: EntityManager,
    @Inject(tokens.EventLoader) private eventLoader: EventLoader,
    @Inject(tokens.InviteTokenLoader) private inviteLoader: InviteTokenLoader,
    @Inject(tokens.PendingMembershipLoader) private pendingMembershipLoader: PendingMembershipLoader
  ) {}

  @Authenticated()
  @Query(() => User)
  user(
    @Ctx() ctx: AuthenticatedContext
  ) {
    return Object.assign({}, new User(), { email: ctx.email });
  }
  
  @Authenticated()
  @FieldResolver(() => [InviteToken])
  async invites(
    @Ctx() ctx: AuthenticatedContext
  ) {
    return this.inviteLoader.byEmails.load(ctx.email);
  }
  
  @Authenticated()
  @FieldResolver(() => [Event])
  async events(
    @Ctx() ctx: AuthenticatedContext
  ) {
    return this.eventLoader.byEmails.load(ctx.email);
  }
  
  @Authenticated()
  @FieldResolver(() => [PendingMembership])
  async pendingMemberships(
    @Ctx() ctx: AuthenticatedContext
  ) {
    return this.pendingMembershipLoader.byEmails.load(ctx.email);
  }
}
