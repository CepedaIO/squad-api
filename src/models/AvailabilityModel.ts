import {Field, InputType, ObjectType} from "type-graphql";
import {Column, Entity, ManyToOne} from "typeorm";
import {MutBaseModel} from "./BaseModel";
import {MembershipModel} from "./MembershipModel";
import {IAvailability, IRangeForm, Demote, AsMut} from "event-matcher-shared";

@InputType()
export class RangeForm implements Demote<IRangeForm> {
  @Field()
  start: Date;

  @Field()
  end: Date;
}

@ObjectType()
@Entity('availabilities')
export class AvailabilityModel extends MutBaseModel implements AsMut<IAvailability> {
  @Field()
  @Column()
  start: Date;

  @Field()
  @Column()
  end: Date;

  @ManyToOne(() => MembershipModel, membership => membership.availabilities)
  membership: MembershipModel;
}
