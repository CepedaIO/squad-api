import {Field, InputType, ObjectType} from "type-graphql";
import {DateTime, Interval} from "luxon";
import {IRangeForm, IAvailabilityBase} from "event-matcher-shared"

@ObjectType()
export class RangeForm implements IRangeForm {
  @Field()
  start: DateTime;
  
  @Field()
  end: DateTime;
  
  static fromInterval(interval: Interval): RangeForm {
    return Object.assign({}, new RangeForm(), {
      start: interval.start,
      end: interval.end
    });
  }
}

@InputType()
export class AvailabilityForm implements IAvailabilityBase {
  @Field()
  start: DateTime;
  
  @Field()
  end: DateTime;
}
