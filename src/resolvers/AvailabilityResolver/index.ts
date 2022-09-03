import {Arg, Mutation, Resolver} from "type-graphql";
import {Authenticated} from "../../decorators/Authenticated";
import {Transaction} from "../../decorators/Transaction";
import {Service} from "typedi";
import {Database} from "../../utils/typeorm";
import {AvailabilityEntity} from "../../entities/AvailabilityEntity";

@Service()
@Resolver()
export default class AvailabilityResolver {
  constructor(
  private db: Database,
  ) {}

  @Authenticated()
  @Transaction()
  @Mutation(() => AvailabilityEntity, {
    description: 'Create availability'
  })
  async upsertAvailability(
  @Arg("payload", () => AvailabilityEntity) availability: AvailabilityEntity
  ): Promise<AvailabilityEntity> {
    return this.db.upsert(AvailabilityEntity, availability);
  }
}
