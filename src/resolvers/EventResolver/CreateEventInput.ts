import {Field, InputType} from "type-graphql";
import {IAvailability, ICreateEventInput} from "event-matcher-shared";
import {RangeForm} from "../../models/AvailabilityModel";

@InputType()
export default class CreateEventInput implements ICreateEventInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  precision: string;

  @Field()
  factor: number;

  @Field()
  displayName: string;

  @Field(() => [RangeForm])
  availabilities: IAvailability[];
}
