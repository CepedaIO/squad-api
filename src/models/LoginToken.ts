import {BaseModel} from "./BaseModel";
import {Column, Entity, JoinColumn, OneToOne} from "typeorm";
import {Account} from "./Account";
import {Session} from "./Session";

@Entity('login_tokens')
export class LoginToken extends BaseModel {
  @Column()
  token: string;

  @OneToOne(() => Account, { nullable:false})
  @JoinColumn()
  public account: Account;

  @OneToOne(() => Session, { nullable:false })
  @JoinColumn()
  public session: Session;
}
