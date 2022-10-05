import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {MutEntity} from "./BaseEntity";
import {AvailabilityEntity} from "./AvailabilityEntity";
import {EventEntity} from "./EventEntity";
import {MembershipPermissionsEntity} from "./MembershipPermissionEntity";
import {IMembershipEntity} from "event-matcher-shared";

@ObjectType()
@Entity('memberships')
export class MembershipEntity extends MutEntity implements IMembershipEntity {
  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  displayName: string;

  @Column()
  eventId: number;

  @ManyToOne(
    () => EventEntity,
    event => event.memberships,
    { nullable: false, onDelete:'CASCADE' }
  )
  event: EventEntity;

  @OneToOne(
    () => MembershipPermissionsEntity,
    permissions => permissions.membership,
    { nullable: false, cascade: ['insert'], eager: true }
  )
  permissions: MembershipPermissionsEntity;

  @OneToMany(
    () => AvailabilityEntity,
    availability => availability.membership,
    { cascade: ['insert'], eager: true }
  )
  availabilities: AvailabilityEntity[];
}
