import {BaseEntity} from "./BaseEntity";
import {Column, Entity, Generated, JoinColumn, OneToOne} from "typeorm";
import {SessionEntity} from "./SessionEntity";
import {Field} from "type-graphql";

@Entity('login_tokens')
export class LoginTokenEntity extends BaseEntity {
  @Field()
  @Column()
  @Generated('uuid')
  uuid!: string;

  @Column({ nullable: false })
  token: string;

  @OneToOne(() => SessionEntity, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  public session: SessionEntity;
}
