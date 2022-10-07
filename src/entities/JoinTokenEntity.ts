import {BaseEntity} from "./BaseEntity";
import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {EventEntity} from "./EventEntity";
import {DateTime} from "luxon";
import {DateTimeColumn} from "../utils/typeorm";
import path from "path";
import {IJoinLinkEntity} from "event-matcher-shared";

@ObjectType()
@Entity('join_links')
export class JoinLinkEntity extends BaseEntity implements IJoinLinkEntity {
  @Column({ nullable: false, unique: true })
  key: string;
  
  @Field({
    nullable: true
  })
  @Column({
    ...DateTimeColumn,
    nullable: true
  })
  expiresOn?: DateTime;
  
  @Field()
  @Column({ nullable: false })
  message: string;
  
  @Field()
  @Column({ nullable: false })
  eventId: number;

  @ManyToOne(() => EventEntity, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  event: EventEntity;
  
  get expired() {
    return this.expiresOn <= DateTime.now();
  }
  
  get link() {
    return path.join('/join', this.key);
  }
}
