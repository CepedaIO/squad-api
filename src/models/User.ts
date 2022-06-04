import {Column, Entity, OneToMany, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {Group} from "./Group";
import {Availability} from "./Availability";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @OneToMany(type => Availability, (availability:Availability) => availability.owner)
  availabilities!: Availability[];

  @ManyToMany(type => Group, group => group.owner)
  groups!: Group[];
}
