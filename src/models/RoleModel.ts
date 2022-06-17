import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {AccountModel} from "./AccountModel";

@Entity('roles')
export class RoleModel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AccountModel, (account) => account.id)
  account: AccountModel;

  @Column({ unique: true })
  name!: string;
}
