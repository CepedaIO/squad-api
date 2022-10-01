import {IEventSummary, IInviteSummary} from "event-matcher-shared";
import {Field, ObjectType} from "type-graphql";
import {MembershipEntity} from "../../entities/MembershipEntity";
import {Duration} from "../Duration";
import {EventEntity} from "../../entities/EventEntity";

@ObjectType()
export class EventStub {
  @Field()
  id: number;
  
  @Field()
  name: string;
}

@ObjectType()
export class InviteSummary implements IInviteSummary {
  @Field()
  public uuid: string;
  
  @Field()
  public key: string;
  
  @Field(() => EventStub)
  public event: EventStub;
  
  @Field()
  public from: string;
  
  @Field()
  public expiresOn: Date;
}

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

export function eventSummaryFor(event: EventEntity): EventSummary {
  return Object.assign(new EventSummary(), event, {
    admin: event.memberships[0],
    duration: event.duration
  })
}
