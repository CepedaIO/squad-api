import {BaseModel} from "./BaseModel";
import {Column, Entity, Generated, JoinColumn, OneToOne} from "typeorm";
import {SessionModel} from "./SessionModel";
import {Field} from "type-graphql";

@Entity('login_tokens')
export class LoginTokenModel extends BaseModel {
  @Field()
  @Column()
  @Generated('uuid')
  uuid!: string;

  @Column({ nullable: false })
  token: string;

  @OneToOne(() => SessionModel, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  public session: SessionModel;
}
