import {Arg, Mutation, Resolver} from "type-graphql";
import {Authenticated} from "../../decorators/Authenticated";
import {Transaction} from "../../decorators/Transaction";
import {Service} from "typedi";
import {AvailabilityEntity} from "../../entities/AvailabilityEntity";
import {EntityManager} from "typeorm";

@Service()
@Resolver()
export default class AvailabilityResolver {
  constructor(
    private manager: EntityManager,
  ) {}

  @Authenticated()
  @Transaction()
  @Mutation(() => AvailabilityEntity, {
    description: 'Create availability'
  })
  async upsertAvailability(
  @Arg("payload", () => AvailabilityEntity) availability: AvailabilityEntity
  ): Promise<AvailabilityEntity> {
    return this.manager.save(AvailabilityEntity, availability);
  }
}
