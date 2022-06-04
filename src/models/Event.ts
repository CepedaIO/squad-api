import {Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Group} from "./Group";
import {Availability} from "./Availability";

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  image!: string;

  @ManyToMany(type => Availability, availability => availability.owner)
  availabilities!: Availability[];

  @OneToMany(type => Group, group => group.owner)
  groups!: Group[];
}
