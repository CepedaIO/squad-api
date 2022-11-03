import {MutEntity} from "./BaseEntity";
import {Column, Entity, JoinColumn, OneToOne} from "typeorm";
import {Field, InputType, ObjectType} from "type-graphql";
import {Membership} from "./Membership";
import {IMembershipPermissionsEntity} from "squad-shared";

@ObjectType('MembershipPermissionOut')
@InputType('MembershipPermissionIn')
@Entity('membership_permissions')
export class MembershipPermission extends MutEntity implements IMembershipPermissionsEntity {
  @Column()
  @Field()
  membershipId: number;

  @OneToOne(() => Membership, { nullable: false, onDelete:'CASCADE' })
  @JoinColumn()
  membership: Membership;

  @Field()
  @Column({ default: false })
  isAdmin: boolean;
}
