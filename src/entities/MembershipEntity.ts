import {Column, Entity, ManyToOne, OneToMany, OneToOne} from "typeorm";
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

  @ManyToOne(() => EventEntity, event => event.memberships)
  event: EventEntity;

  @Field(() => MembershipPermissionsEntity)
  @OneToOne(() => MembershipPermissionsEntity, permissions => permissions.membership, {
    cascade: ['insert']
  })
  permissions: MembershipPermissionsEntity;

  @Field(() => [AvailabilityEntity])
  @OneToMany(() => AvailabilityEntity, availability => availability.membership, {
    cascade: ['insert']
  })
  availabilities: AvailabilityEntity[];
}
