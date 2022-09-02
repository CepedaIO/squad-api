import {Arg, Mutation, Resolver} from "type-graphql";
import {Authenticated} from "../../decorators/Authenticated";
import {Transaction} from "../../decorators/Transaction";
import {Service} from "typedi";
import {Database} from "../../utils/typeorm";
import {MembershipModel} from "../../models/MembershipModel";

@Service()
@Resolver()
export default class MembershipResolver {
  constructor(
    private db: Database,
  ) {}

  @Authenticated()
  @Transaction()
  @Mutation(() => MembershipModel, {
    description: 'Create a membership'
  })
  async upsertMembership(
  @Arg("payload", () => MembershipModel) membership: MembershipModel
  ): Promise<MembershipModel> {
    return this.db.upsert(MembershipModel, membership);
  }
}
