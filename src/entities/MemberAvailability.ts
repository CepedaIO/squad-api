import {Field, ObjectType} from "type-graphql";
import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {MutEntity} from "./BaseEntity";
import {Membership} from "./Membership";
import {IAvailabilityEntity} from "event-matcher-shared";
import {DateTime} from "luxon";
import {DateTimeColumn} from "../utils/typeorm";

@ObjectType()
@Entity('member_availabilities')
export class MemberAvailability extends MutEntity implements IAvailabilityEntity {
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
    () => Membership,
    membership => membership.availabilities,
    { nullable:false, onDelete:'CASCADE' }
  )
  @JoinColumn()
  membership: Membership;
}
