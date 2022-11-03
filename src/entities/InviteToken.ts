import {BaseEntity} from "./BaseEntity";
import {Column, Entity, Generated, JoinColumn, ManyToOne} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {Event} from "./Event";
import {DateTime} from "luxon";
import {DateTimeColumn} from "../utils/typeorm";
import {IInviteTokenEntity} from "squad-shared"

@ObjectType()
@Entity('invite_tokens')
export class InviteToken extends BaseEntity implements IInviteTokenEntity {
  @Field()
  @Column({ nullable: false})
  @Generated('uuid')
  uuid: string;
  
  @Field()
  @Column({ nullable: false })
  key: string;
  
  @Field()
  @Column(DateTimeColumn)
  expiresOn: DateTime;
  
  @Field()
  @Column({ nullable: false })
  from: string;
  
  @Field()
  @Column({ nullable: false})
  email: string;
  
  @Field()
  @Column()
  public eventId: number;

  @Field(() => Event)
  @ManyToOne(() => Event, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  public event: Event;
  
  get expired() {
    return this.expiresOn <= DateTime.now();
  }
  
  isFromWire(obj: any): obj is Event {
    return !!obj.uuid && !!obj.key && !!obj.email;
  }
}
