import {Column, Entity} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {MutEntity} from "./BaseEntity";
import {IPendingMembershipEntity, IAvailabilityBase, Demote} from "event-matcher-shared";
import {promote} from "../utils/shared-shim";
import {MemberAvailability} from "./MemberAvailability";

@ObjectType()
@Entity('pending_memberships')
export class PendingMembership extends MutEntity implements IPendingMembershipEntity {
  @Field()
  @Column()
  email: string;
  
  @Field()
  @Column()
  displayName: string;
  
  @Column()
  eventId: number;
  
  @Column('jsonb', {
    transformer: {
      to: (value: MemberAvailability[]) => value,
      from: (value: Demote<MemberAvailability>[]) => promote(value)
    }
  })
  availabilities: MemberAvailability[];
}
