import {Field, InputType, ObjectType} from "type-graphql";
import {DurationObjectUnits} from "luxon/src/duration";

@ObjectType('DurationO')
@InputType('DurationI')
export class Duration implements DurationObjectUnits {
  @Field({ nullable: true })
  public days?: number;
  @Field({ nullable: true })
  public hours?: number;
  @Field({ nullable: true })
  public minutes?: number;
}
