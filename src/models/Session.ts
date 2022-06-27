import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Account} from "./Account";
import {BaseModel} from "./BaseModel";

@Entity('sessions')
export class Session extends BaseModel {
  @ManyToOne(() => Account, { nullable:false })
  @JoinColumn()
  account: Account;

  @Column({ unique: true })
  key!: string;
}
