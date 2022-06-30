import {BaseModel} from "./BaseModel";
import {Column, Entity, JoinColumn, OneToOne} from "typeorm";
import {Session} from "./Session";

@Entity('login_tokens')
export class LoginToken extends BaseModel {
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
