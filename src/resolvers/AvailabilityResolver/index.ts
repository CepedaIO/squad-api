import {Arg, Mutation, Resolver} from "type-graphql";
import {Authenticated} from "../../decorators/Authenticated";
import {Transaction} from "../../decorators/Transaction";
import {Service} from "typedi";
import {Database} from "../../utils/typeorm";
import {AvailabilityModel} from "../../models/AvailabilityModel";

@Service()
@Resolver()
export default class AvailabilityResolver {
  constructor(
  private db: Database,
  ) {}

  @Authenticated()
  @Transaction()
  @Mutation(() => AvailabilityModel, {
    description: 'Create availability'
  })
  async upsertAvailability(
  @Arg("payload", () => AvailabilityModel) availability: AvailabilityModel
  ): Promise<AvailabilityModel> {
    return this.db.upsert(AvailabilityModel, availability);
  }
}
