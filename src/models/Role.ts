import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Account} from "./Account";

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, { nullable:false })
  @JoinColumn()
  account: Account;

  @Column({ unique: true })
  name!: string;
}
