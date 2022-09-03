import {Field, InputType} from "type-graphql";
import {IAvailability, ICreateEventInput} from "event-matcher-shared";
import {RangeForm} from "../../entities/AvailabilityEntity";
import {Duration} from "../Duration";

@InputType()
export default class CreateEventInput implements ICreateEventInput {
  @Field()
  name: string;

  @Field()
  img: string;

  @Field()
  description: string;

  @Field(() => Duration)
  duration: Duration;

  @Field()
  displayName: string;

  @Field(() => [RangeForm])
  availabilities: IAvailability[];
}
