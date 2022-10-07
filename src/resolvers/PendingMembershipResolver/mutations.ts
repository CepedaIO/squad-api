import {Inject, Service} from "typedi";
import {Arg, Ctx, Mutation, Resolver} from "type-graphql";
import {EntityManager} from "typeorm";
import {tokens} from "../../tokens";
import {EventLoader} from "../../dataloaders/EventEntity";
import {PendingMembershipEntity} from "../../entities/PendingMembershipEntity";
import {Authenticated} from "../../decorators/Authenticated";
import {SimpleResponse} from "../SimpleResponse";
import {MembershipLoader} from "../../dataloaders/MembershipEntity";
import {AuthenticatedContext} from "../../utils/context";
import {ForbiddenError} from "apollo-server-errors";
import {PendingMembershipLoader} from "../../dataloaders/PendingMembershipEntity";
import {UserInputError} from "apollo-server";
import {MembershipEntity} from "../../entities/MembershipEntity";

@Service()
@Resolver(() => PendingMembershipEntity)
export default class PendingMembershipMutations {
  constructor(
    private manager: EntityManager,
    @Inject(tokens.EventLoader) private eventLoader: EventLoader,
    @Inject(tokens.PendingMembershipLoader) private pendingMembershipLoader: PendingMembershipLoader,
    @Inject(tokens.MembershipLoader) private membershipLoader: MembershipLoader
  ) {
  }
  
  @Authenticated()
  @Mutation(() => SimpleResponse)
  async consumePendingMembership(
    @Arg('id') id: number,
    @Arg('eventId') eventId: number,
    @Arg('accept') accept: boolean,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<SimpleResponse> {
    const isAdmin = await this.eventLoader.areAdmins.load([eventId, ctx.email]);
    
    if(!isAdmin) throw new ForbiddenError('Must be admin of that event');
    
    const pending = await this.pendingMembershipLoader.byIds.load(id);
    
    if(pending.eventId !== eventId) throw new UserInputError('Pending membership is not part of event');
    await this.manager.save(MembershipEntity, {
      email: pending.email,
      displayName: pending.displayName,
      availabilities: pending.availabilities,
      eventId: pending.eventId,
      permissions: {
        isAdmin: false
      }
    });
    
    await this.manager.delete(PendingMembershipEntity, { id: pending.id })
    
    return {
      success: true,
      result: 'Pending membership has been consumed'
    }
  }
}
