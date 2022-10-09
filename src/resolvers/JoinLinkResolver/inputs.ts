import {Field, InputType} from "type-graphql";
import {AvailabilityEntity, AvailabilityForm, RangeForm} from "../../entities/AvailabilityEntity";

@InputType()
export class RequestJoinInput {
  @Field()
  key: string;
  
  @Field()
  eventId: number;
  
  @Field()
  displayName: string;
  
  @Field(() => [AvailabilityForm])
  availabilities: AvailabilityEntity[];
}
