import {Field, InputType, ObjectType} from "type-graphql";
import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {MutBaseModel} from "./BaseModel";
import {Membership} from "./Membership";

@InputType()
export class RangeForm {
  @Field()
  start: Date;

  @Field()
  end: Date;
}

@ObjectType()
@Entity('availabilities')
export class Availability extends MutBaseModel {
  @Field()
  @Column()
  start: Date;

  @Field()
  @Column()
  end: Date;

  eventId
  @ManyToOne(() => Membership, membership => membership.availability)
  membership: Membership;
}
