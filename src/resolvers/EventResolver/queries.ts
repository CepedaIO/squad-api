import {Arg, Ctx, FieldResolver, Query, Resolver, Root} from "type-graphql";
import {ForbiddenError} from "apollo-server-errors";
import {EventEntity} from "../../entities/EventEntity";
import {Authenticated} from "../../decorators/Authenticated";
import {Inject, Service} from "typedi";
import {MembershipEntity} from "../../entities/MembershipEntity";
import {AuthenticatedContext} from "../../utils/context";
import {EntityManager} from "typeorm";
import {MembershipService} from "../../services/MembershipService";
import {AuthenticationError} from "apollo-server";
import {InviteTokenEntity} from "../../entities/InviteTokenEntity";
import {HTMLService} from "../../services/HTMLService";
import {TokenService} from "../../services/TokenService";
import {JoinLinkEntity} from "../../entities/JoinTokenEntity";
import {EventLoader} from "../../dataloaders/EventEntity";
import {tokens} from "../../tokens";
import {JoinLinkLoader} from "../../dataloaders/TokenEntity";
import {MembershipLoader} from "../../dataloaders/MembershipEntity";

@Service()
@Resolver(() => EventEntity)
export default class EventQueries {
  constructor(
    private manager: EntityManager,
    private membershipService: MembershipService,
    private htmlService: HTMLService,
    private tokenService: TokenService,
    @Inject(tokens.EventLoader) private eventLoader: EventLoader,
    @Inject(tokens.MembershipLoader) private membershipLoader: MembershipLoader,
    @Inject(tokens.JoinLinkLoader) private joinLinkLoader: JoinLinkLoader,
  ) {}

  @Authenticated()
  @Query(() => EventEntity, {
    description: "Get all events for authenticated user"
  })
  async event(
    @Arg('id') id: number,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<EventEntity | undefined> {
    const { email } = ctx;
    const isMember = await this.eventLoader.areMembers.load([id, email]);
    
    if(!isMember) {
      throw new ForbiddenError('You are not a member of that event');
    }
    
    return this.eventLoader.byIds.load(id);
  }
  
  @Query(() => EventEntity, {
    description: "Get event for invite"
  })
  async eventFromInvite(
    @Arg('uuid') uuid: string,
    @Arg('key') key: string
  ): Promise<EventEntity> {
    const invite = await this.manager.findOneOrFail(InviteTokenEntity, {
      relations: ['event'],
      where: { uuid, key }
    });
  
    if(!invite) {
      throw new AuthenticationError('You cannot get the summary of this invite');
    }
  
    if(invite.expired) {
      throw new ForbiddenError('Invite has expired');
    }
    
    return invite.event;
  }
  
  @FieldResolver(() => [MembershipEntity])
  async admins(
    @Root() event: EventEntity
  ): Promise<MembershipEntity[]> {
    const members = await this.membershipLoader.membersByEventIds.load(event.id);
    return members.filter((member) => member.permissions.isAdmin);
  }
  
  @FieldResolver(() => [MembershipEntity])
  async memberships(
    @Root() event: EventEntity
  ): Promise<MembershipEntity[]> {
    return this.membershipLoader.membersByEventIds.load(event.id);
  }
  
  @FieldResolver(() => MembershipEntity)
  async user(
    @Root() event: EventEntity,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<MembershipEntity> {
    const members = await this.membershipLoader.membersByEventIds.load(event.id);
    return members.find((member) => member.email === ctx.email);
  }

  @Authenticated()
  @FieldResolver(() => String)
  async joinLink(
    @Root() event: EventEntity,
  ): Promise<string> {
    const joinLink = await this.joinLinkLoader.byEventId.load(event.id);
    return joinLink.link;
  }
}
