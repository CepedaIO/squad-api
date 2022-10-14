import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {MutEntity} from "./BaseEntity";
import {Membership} from "./Membership";
import {IEventEntity, IAvailabilityEntity, IEventResolutionEntity} from "event-matcher-shared";
import {InviteToken} from "./InviteToken";
import {JoinLink} from "./JoinLink";
import {DateTime} from "luxon";
import {DateTimeColumn} from "../utils/typeorm";
import {Duration} from "../resolvers/Duration";

@ObjectType()
@Entity('events')
export class Event extends MutEntity implements IEventEntity {
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
  
  @OneToMany(
    () => EventAvailability,
    availability => availability.event,
    { cascade: ['insert'], eager: true }
  )
  availabilities: EventAvailability[];
  
  @OneToMany(
    () => Membership,
    membership => membership.event,
    { cascade: ['insert'] }
  )
  memberships: Membership[];
  
  @OneToMany(
    () => InviteToken,
    invite => invite.event,
    { cascade: ['insert'] }
  )
  invites: InviteToken[];
  
  @OneToMany(
    () => JoinLink,
    link => link.event,
    { cascade: ['insert'] }
  )
  joinLinks: JoinLink[];
  
  @Field(() => Duration)
  get duration(): Duration {
    return {
      [this.precision]: this.factor
    };
  }
  
  set duration(val: Duration) {
    for(const [precision, factor] of Object.entries(val)) {
      if(typeof factor !== "undefined") {
        this.precision = precision;
        this.factor = factor;
      }
    }
  }
}


@ObjectType()
@Entity('event_availabilities')
export class EventAvailability extends MutEntity implements IAvailabilityEntity {
  @Field()
  @Column(DateTimeColumn)
  start: DateTime;
  
  @Field()
  @Column(DateTimeColumn)
  end: DateTime;
  
  @Column()
  @Field()
  eventId: number;
  
  @ManyToOne(
    () => Event,
    event => event.availabilities,
    { nullable:false, onDelete:'CASCADE' }
  )
  @JoinColumn()
  event: Event;
}

@ObjectType()
@Entity('event_resolutions')
export class EventResolution extends MutEntity implements IEventResolutionEntity {
  @Field()
  @Column(DateTimeColumn)
  start: DateTime;
  
  @Field()
  @Column(DateTimeColumn)
  end: DateTime;
  
  @Column()
  @Field()
  eventId: number;
  
  @OneToOne(
    () => Event,
    event => event.availabilities,
    { nullable:false, onDelete:'CASCADE' }
  )
  @JoinColumn()
  event: Event;
}
