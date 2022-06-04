import {Column, Entity, ManyToOne, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {Group} from "./Group";
import {User} from "./User";

@Entity()
export class Availability {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @ManyToOne(type => User, user => user.availabilities)
  owner!: User;

  @ManyToMany(type => Group, group => group.owner)
  groups!: Group[];
}