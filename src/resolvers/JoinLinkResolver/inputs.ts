import {Field, InputType} from "type-graphql";
import {MemberAvailability} from "../../entities/MemberAvailability";
import {AvailabilityForm, RangeForm} from "../GeneralResolver/models";

@InputType()
export class RequestJoinInput {
  @Field()
  key: string;
  
  @Field()
  eventId: number;
  
  @Field()
  displayName: string;
  
  @Field(() => [AvailabilityForm])
  availabilities: MemberAvailability[];
}
