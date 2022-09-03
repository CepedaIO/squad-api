import { IEventSummary } from "event-matcher-shared";
import {Field, ObjectType} from "type-graphql";
import {MembershipEntity} from "../../entities/MembershipEntity";
import {Duration} from "../Duration";

@ObjectType()
export class EventSummary implements IEventSummary {
  @Field()
  public id: number;

  @Field()
  public name: string;

  @Field()
  public img: string;

  @Field()
  public duration: Duration;

  @Field()
  public memberCount: number;

  @Field(() => MembershipEntity)
  public admin: MembershipEntity;
}
