import {Column, Entity, Generated, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Availability} from "./Availability";
import {Group} from "./Group";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Generated('uuid')
  uuid!: string;

  @Column()
  firstname!: string;

  @Column()
  lastname!: string;

  @OneToMany(type => Availability, (availability:Availability) => availability.owner)
  availabilities!: Availability[];

  @ManyToMany(type => Group, group => group.owner)
  groups!: Group[];
}
