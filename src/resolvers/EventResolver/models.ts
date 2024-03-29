import {Field, InputType} from "type-graphql";
import {Duration} from "../Duration";
import {MemberAvailability} from "../../entities/MemberAvailability";
import {ICreateEventInput, IInviteMemberInput} from "squad-shared";
import {AvailabilityForm} from "../GeneralResolver/models";

@InputType()
export class CreateEventInput implements ICreateEventInput {
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
  
  @Field()
  anytime: boolean;

  @Field(() => [AvailabilityForm])
  availabilities: AvailabilityForm[];
  
  @Field(() => [AvailabilityForm])
  eventAvailabilities: AvailabilityForm[];
}

@InputType()
export class AcceptEventInput {
  @Field()
  uuid: string;
  
  @Field()
  key: string;
  
  @Field()
  eventId: number;
  
  @Field()
  displayName: string;
  
  @Field(() => [AvailabilityForm])
  availabilities: MemberAvailability[];
}

@InputType()
export class InviteMemberInput implements IInviteMemberInput {
  @Field()
  email: string;
  
  @Field()
  message: string;
  
  @Field()
  id: number;
}
