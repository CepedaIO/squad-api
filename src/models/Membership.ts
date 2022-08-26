import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";
import {Field, InputType, ObjectType} from "type-graphql";
import {BaseModel} from "./BaseModel";
import {Availability} from "./Availability";
import {Event} from "./Event";
import {MembershipPermissions} from "./MembershipPermission";

@InputType()
export class MembershipInput {
  @Field()
  email: string;

  @Field()
  displayName: string;

  @Field()
  eventId: number;
}

@ObjectType()
@Entity('memberships')
export class Membership extends BaseModel {
  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  displayName: string;

  @ManyToOne(() => Event, event => event.memberships)
  event: Event;

  @OneToOne(() => MembershipPermissions, permissions => permissions.membership, {
    cascade: ['insert']
  })
  permissions: MembershipPermissions;

  @Field(() => [Availability])
  @OneToMany(() => Availability, availability => availability.membership, {
    cascade: ['insert']
  })
  availability: Availability[];
}
