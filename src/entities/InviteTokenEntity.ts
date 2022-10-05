import {BaseEntity} from "./BaseEntity";
import {Column, Entity, Generated, JoinColumn, ManyToOne} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {EventEntity} from "./EventEntity";
import {DateTime} from "luxon";
import {DateTimeColumn} from "../utils/typeorm";
import {IInviteToken} from "event-matcher-shared"

@ObjectType()
@Entity('invite_tokens')
export class InviteTokenEntity extends BaseEntity implements  IInviteToken {
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

  @Field(() => EventEntity)
  @ManyToOne(() => EventEntity, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  public event: EventEntity;
  
  get expired() {
    return this.expiresOn <= DateTime.now();
  }
  
  isFromWire(obj: any): obj is EventEntity {
    return !!obj.uuid && !!obj.key && !!obj.email;
  }
}
