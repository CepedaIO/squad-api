import {Column, Entity, OneToMany} from "typeorm";
import {Field, InputType, ObjectType} from "type-graphql";
import {Duration} from "luxon";
import {MutBaseModel} from "./BaseModel";
import {Membership} from "./Membership";

@InputType('EventIn')
@ObjectType('EventOut')
@Entity('events')
export class Event extends MutBaseModel {
  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  precision: string;

  @Field()
  @Column()
  factor: number;

  @Field(() => Membership)
  @OneToMany(() => Membership, membership => membership.event)
  memberships: Membership[]

  set duration(duration: Duration) {
    this.precision = Object.keys(duration)[0];
    this.factor = Object.values(duration)[0];
  }

  get duration(): Duration {
    return Duration.fromDurationLike({
      [this.precision]: this.factor
    });
  }
}
