import {Field, ObjectType} from "type-graphql";
import {Event} from "../../models/Event";
import {Membership} from "../../models/Membership";

@ObjectType()
export class CreateEventInput {
  @Field()
  event: Event;

  @Field()
  membership: Membership;
}

export default async function createEvent(payload: CreateEventInput) {

}
