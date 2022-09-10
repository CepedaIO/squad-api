import {Column, Entity, OneToMany, Unique} from "typeorm";
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

  set duration(val: Duration) {
    for(const [precision, factor] of Object.entries(val)) {
      if(typeof factor !== "undefined") {
        this.precision = precision;
        this.factor = factor;
      }
    }
  }

  @Field(() => [MembershipEntity])
  @OneToMany(() => MembershipEntity, membership => membership.event, { cascade: true })
  memberships: MembershipEntity[];

  @Field(() => [InviteTokenEntity])
  @OneToMany(() => InviteTokenEntity, invite => invite.event, { cascade: true })
  invites: InviteTokenEntity[];
}
