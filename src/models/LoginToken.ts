import {BaseModel} from "./BaseModel";
import {Column, Entity, Generated, JoinColumn, OneToOne} from "typeorm";
import {Session} from "./Session";
import {Field} from "type-graphql";

@Entity('login_tokens')
export class LoginToken extends BaseModel {
  @Field()
  @Generated('uuid')
  uuid!: string;

  @Column({ nullable: false })
  token: string;

  @OneToOne(() => Session, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  public session: Session;
}
