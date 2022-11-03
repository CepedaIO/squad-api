import {Column, Entity} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {MutEntity} from "./BaseEntity";
import {IPendingMembershipEntity, IAvailabilityBase, Demote} from "squad-shared";
import {JSONColumn} from "../utils/typeorm";

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
  
  @Column(JSONColumn)
  availabilities: IAvailabilityBase[];
}
