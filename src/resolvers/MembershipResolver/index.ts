import {Arg, Mutation, Resolver} from "type-graphql";
import {Authenticated} from "../../decorators/Authenticated";
import {Transaction} from "../../decorators/Transaction";
import {Service} from "typedi";
import {Database} from "../../utils/typeorm";
import {Membership} from "../../models/Membership";

@Service()
@Resolver()
export default class MembershipResolver {
  constructor(
    private db: Database,
  ) {}

  @Authenticated()
  @Transaction()
  @Mutation(() => Membership, {
    description: 'Create a membership'
  })
  async upsertMembership(
  @Arg("payload", () => Membership) membership: Membership
  ): Promise<Membership> {
    return this.db.upsert(Membership, membership);
  }
}
