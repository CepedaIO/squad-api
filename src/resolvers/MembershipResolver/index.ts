import {Arg, Mutation, Resolver} from "type-graphql";
import {Authenticated} from "../../decorators/Authenticated";
import {Transaction} from "../../decorators/Transaction";
import {Service} from "typedi";
import {Database} from "../../utils/typeorm";
import {MembershipEntity} from "../../entities/MembershipEntity";

@Service()
@Resolver()
export default class MembershipResolver {
  constructor(
    private db: Database,
  ) {}

  @Authenticated()
  @Transaction()
  @Mutation(() => MembershipEntity, {
    description: 'Create a membership'
  })
  async upsertMembership(
  @Arg("payload", () => MembershipEntity) membership: MembershipEntity
  ): Promise<MembershipEntity> {
    return this.db.upsert(MembershipEntity, membership);
  }
}
