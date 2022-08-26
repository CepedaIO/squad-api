import {Field, InputType} from "type-graphql";
import {IAvailabilityForm} from "event-matcher-shared";
import {RangeForm} from "../../models/Availability";

@InputType()
export default class CreateEventInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  precision: string;

  @Field()
  factor: number;

  @Field()
  email: string;

  @Field()
  displayName: string;

  @Field(() => [RangeForm])
  availability: IAvailabilityForm[];
}
