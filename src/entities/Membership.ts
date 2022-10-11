import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {MutEntity} from "./BaseEntity";
import {MemberAvailability} from "./MemberAvailability";
import {Event} from "./Event";
import {MembershipPermission} from "./MembershipPermission";
import {IMembershipEntity} from "event-matcher-shared";

@ObjectType()
@Entity('memberships')
export class Membership extends MutEntity implements IMembershipEntity {
  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  displayName: string;

  @Column()
  eventId: number;

  @ManyToOne(
    () => Event,
    event => event.memberships,
    { nullable: false, onDelete:'CASCADE' }
  )
  event: Event;

  @OneToOne(
    () => MembershipPermission,
    permissions => permissions.membership,
    { nullable: false, cascade: ['insert'], eager: true }
  )
  permissions: MembershipPermission;

  @OneToMany(
    () => MemberAvailability,
    availability => availability.membership,
    { cascade: ['insert'], eager: true }
  )
  availabilities: MemberAvailability[];
}
