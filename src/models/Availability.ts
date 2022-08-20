import {Field, InputType, ObjectType} from "type-graphql";
import {Column, Entity, ManyToOne} from "typeorm";
import {MutBaseModel} from "./BaseModel";
import {Membership} from "./Membership";

@InputType('AvailabilityIn')
@ObjectType('AvailabilityOut')
@Entity('availabilities')
export class Availability extends MutBaseModel {
  @Field()
  @Column()
  start: Date;

  @Field()
  @Column()
  end: Date;

  @Field(() => Membership, { nullable: true })
  @ManyToOne(() => Membership, membership => membership.availability)
  membership: Membership;
}
