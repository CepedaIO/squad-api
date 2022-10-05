import {Column, Entity, OneToMany} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {MutEntity} from "./BaseEntity";
import {MembershipEntity} from "./MembershipEntity";
import {IEventEntity} from "event-matcher-shared";
import {Duration} from "../resolvers/Duration";
import {InviteTokenEntity} from "./InviteTokenEntity";

@ObjectType()
@Entity('events')
export class EventEntity extends MutEntity implements IEventEntity {
  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  img: string;

  @Field()
  @Column()
  description: string;

  @Column()
  precision: string;

  @Column()
  factor: number;

  @Field(() => Duration)
  get duration(): Duration {
    return Object.assign(new Duration(), {
      [this.precision]: this.factor
    });
  }
  
  @OneToMany(
    () => MembershipEntity,
    membership => membership.event,
    { cascade: ['insert'], eager: true }
  )
  memberships: MembershipEntity[];
  
  @OneToMany(
    () => InviteTokenEntity,
    invite => invite.event,
    { cascade: ['insert'], eager: true }
  )
  invites: InviteTokenEntity[];

  set duration(val: Duration) {
    for(const [precision, factor] of Object.entries(val)) {
      if(typeof factor !== "undefined") {
        this.precision = precision;
        this.factor = factor;
      }
    }
  }
}
