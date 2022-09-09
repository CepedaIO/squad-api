import {Arg, Mutation, Resolver} from "type-graphql";
import {Authenticated} from "../../decorators/Authenticated";
import {Transaction} from "../../decorators/Transaction";
import {Service} from "typedi";
import {MembershipEntity} from "../../entities/MembershipEntity";
import {EntityManager} from "typeorm";

@Service()
@Resolver()
export default class MembershipResolver {
  constructor(
    private manager: EntityManager,
  ) {}

  @Authenticated()
  @Transaction()
  @Mutation(() => MembershipEntity, {
    description: 'Create a membership'
  })
  async upsertMembership(
  @Arg("payload", () => MembershipEntity) membership: MembershipEntity
  ): Promise<MembershipEntity> {
    return this.manager.save(MembershipEntity, membership);
  }
}
