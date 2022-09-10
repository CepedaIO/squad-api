import {Field, InputType} from "type-graphql";
import {RangeForm} from "../../entities/AvailabilityEntity";
import {IAvailability} from "event-matcher-shared";
import {SessionExpiration} from "../AuthResolver/AuthService";

@InputType()
export default class AcceptInviteInput {
  @Field()
  uuid: string;

  @Field()
  key: string;

  @Field()
  eventId: number;

  @Field()
  displayName: string;

  @Field(() => [RangeForm])
  availabilities: IAvailability[];

  @Field(() => SessionExpiration)
  expires: SessionExpiration;
}
