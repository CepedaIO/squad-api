import {Field, InputType} from "type-graphql";
import {Duration} from "../Duration";
import {AvailabilityEntity, AvailabilityForm} from "../../entities/AvailabilityEntity";
import {ICreateEventInput, IInviteMemberInput} from "event-matcher-shared";

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
  
  @Field(() => [AvailabilityForm])
  availabilities: AvailabilityEntity[];
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
  availabilities: AvailabilityEntity[];
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
