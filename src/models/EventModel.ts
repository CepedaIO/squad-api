import {Column, Entity, OneToMany} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {MutBaseModel} from "./BaseModel";
import {MembershipModel} from "./MembershipModel";
import {IEvent, AsMut} from "event-matcher-shared";

@ObjectType()
@Entity('events')
export class EventModel extends MutBaseModel implements AsMut<IEvent> {
  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  precision: string;

  @Field()
  @Column()
  factor: number;

  @Field(() => [MembershipModel])
  @OneToMany(() => MembershipModel, membership => membership.event, {
    cascade: ['insert']
  })
  memberships: MembershipModel[];
}
