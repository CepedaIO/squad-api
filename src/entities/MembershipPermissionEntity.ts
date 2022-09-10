import {MutEntity} from "./BaseEntity";
import {Column, Entity, JoinColumn, OneToOne} from "typeorm";
import {Field, InputType, ObjectType} from "type-graphql";
import {MembershipEntity} from "./MembershipEntity";
import {IMembershipPermissionsEntity} from "event-matcher-shared";

@ObjectType('MembershipPermissionOut')
@InputType('MembershipPermissionIn')
@Entity('membership_permissions')
export class MembershipPermissionsEntity extends MutEntity implements IMembershipPermissionsEntity {
  @Column()
  @Field()
  membershipId: number;

  @OneToOne(() => MembershipEntity, { nullable: false, onDelete:'CASCADE' })
  @JoinColumn()
  membership: MembershipEntity;

  @Field()
  @Column({ default: false })
  isAdmin: boolean;
}
