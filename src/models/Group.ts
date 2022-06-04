import {Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";
import {Availability} from "./Availability";

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @ManyToOne(type => User, user => user.groups)
  owner!: User;

  @ManyToMany(type => Availability, availability => availability.groups)
  availabilities!: Availability[];
}
