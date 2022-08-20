import {Column, Entity, ManyToOne, OneToMany} from "typeorm";
import {Field, InputType, ObjectType} from "type-graphql";
import {BaseModel} from "./BaseModel";
import {Availability} from "./Availability";
import {Event} from "./Event";

@InputType('MembershipIn')
@ObjectType()
@Entity('MembershipOut')
export class Membership extends BaseModel {
  @Field()
  email: string;

  @Field()
  @Column()
  displayName: string;

  @Field(() => Event, { nullable: true })
  @ManyToOne(() => Event, event => event.memberships)
  event: Event;

  @Field(() => Availability)
  @OneToMany(() => Availability, availability => availability.membership)
  availability: Availability[];
}
