import {BaseEntity} from "./BaseEntity";
import {Column, Entity, Generated, JoinColumn, ManyToOne} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {EventEntity} from "./EventEntity";

@ObjectType()
@Entity('invite_tokens')
export class InviteTokenEntity extends BaseEntity {
  @Field()
  @Column()
  @Generated('uuid')
  uuid!: string;

  @Column({ nullable: false })
  key: string;

  @Column({ nullable: false })
  expiresOn: Date;

  @Column()
  email: string;

  @ManyToOne(() => EventEntity, {
    nullable: false,
    eager: true
  })
  @JoinColumn()
  public event: EventEntity;
}
