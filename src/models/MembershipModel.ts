import {Column, Entity, ManyToOne, OneToMany, OneToOne} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {MutBaseModel} from "./BaseModel";
import {AvailabilityModel} from "./AvailabilityModel";
import {EventModel} from "./EventModel";
import {MembershipPermissionsModel} from "./MembershipPermissionModel";
import {IMembership, AsMut} from "event-matcher-shared";

@ObjectType()
@Entity('memberships')
export class MembershipModel extends MutBaseModel implements AsMut<IMembership> {
  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  displayName: string;

  @ManyToOne(() => EventModel, event => event.memberships)
  event: EventModel;

  @OneToOne(() => MembershipPermissionsModel, permissions => permissions.membership, {
    cascade: ['insert']
  })
  permissions: MembershipPermissionsModel;

  @Field(() => [AvailabilityModel])
  @OneToMany(() => AvailabilityModel, availability => availability.membership, {
    cascade: ['insert']
  })
  availabilities: AvailabilityModel[];
}
