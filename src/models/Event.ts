import {Column, Entity, JoinColumn, OneToMany, OneToOne} from "typeorm";
import {Field, InputType, ObjectType} from "type-graphql";
import {Duration} from "luxon";
import {MutBaseModel} from "./BaseModel";
import {Membership} from "./Membership";

@InputType()
export class EventInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  precision: string;

  @Field()
  factor: number;
}

@ObjectType()
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

  @Field(() => [Membership])
  @OneToMany(() => Membership, membership => membership.event, {
    cascade: ['insert']
  })
  memberships: Membership[];

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
