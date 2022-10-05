import {Field, InputType, ObjectType} from "type-graphql";
import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {MutEntity} from "./BaseEntity";
import {MembershipEntity} from "./MembershipEntity";
import {IAvailabilityEntity, IRangeForm} from "event-matcher-shared";
import {DateTime} from "luxon";
import {DateTimeColumn} from "../utils/typeorm";

@InputType()
export class RangeForm implements IRangeForm {
  @Field()
  start: DateTime;

  @Field()
  end: DateTime;
}

@ObjectType()
@Entity('availabilities')
export class AvailabilityEntity extends MutEntity implements IAvailabilityEntity {
  @Field()
  @Column(DateTimeColumn)
  start: DateTime;

  @Field()
  @Column(DateTimeColumn)
  end: DateTime;
  
  @Column()
  @Field()
  membershipId: number;

  @ManyToOne(
    () => MembershipEntity,
    membership => membership.availabilities,
    { nullable:false, onDelete:'CASCADE' }
  )
  @JoinColumn()
  membership: MembershipEntity;
}
