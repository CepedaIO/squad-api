import {BaseModel} from "./BaseModel";
import {Entity, ManyToOne, OneToOne, JoinColumn} from "typeorm";
import {Account} from "./Account";

@Entity('pending_signups')
export class PendingSignup extends BaseModel {
  @OneToOne(() => Account, { nullable:false })
  @JoinColumn()
  public account: Account;
}
