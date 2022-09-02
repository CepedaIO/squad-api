import {MutBaseModel} from "./BaseModel";
import {Column, Entity, JoinColumn, OneToOne} from "typeorm";
import {Field, InputType, ObjectType} from "type-graphql";
import {MembershipModel} from "./MembershipModel";

@ObjectType('MembershipPermissionOut')
@InputType('MembershipPermissionIn')
@Entity('membership_permissions')
export class MembershipPermissionsModel extends MutBaseModel {
  @Column()
  @Field()
  membershipId: number;

  @OneToOne(() => MembershipModel)
  @JoinColumn()
  membership: MembershipModel;

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
