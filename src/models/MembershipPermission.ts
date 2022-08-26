import {MutBaseModel} from "./BaseModel";
import {Column, Entity, JoinColumn, OneToOne} from "typeorm";
import {Field, InputType, ObjectType} from "type-graphql";
import {Membership} from "./Membership";

@ObjectType('MembershipPermissionOut')
@InputType('MembershipPermissionIn')
@Entity('membership_permissions')
export class MembershipPermissions extends MutBaseModel {
  @Column()
  @Field()
  membershipId: number;

  @OneToOne(() => Membership)
  @JoinColumn()
  membership: Membership;

  @Field()
  @Column({ default: false })
  isOwner: boolean;

  @Field()
  @Column({ default: false })
  canEdit: boolean;

  @Field()
  @Column({ default: false })
  canKick: boolean;

  @Field()
  @Column({ default: false })
  canBan: boolean;

  @Field()
  @Column({ default: false })
  canMute: boolean;
}
