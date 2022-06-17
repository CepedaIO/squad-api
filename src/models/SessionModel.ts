import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {AccountModel} from "./AccountModel";

@Entity('sessions')
export class SessionModel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AccountModel, (account) => account.id)
  account: AccountModel;

  @Column({ unique: true })
  secret!: string;
}
