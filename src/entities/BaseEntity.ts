import {Column, Generated, PrimaryGeneratedColumn} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {DateTime} from "luxon";
import {DateTimeColumn} from "../utils/typeorm";

@ObjectType()
export abstract class BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({
    ...DateTimeColumn,
    default: () => "CURRENT_TIMESTAMP"
  })
  createdOn!: DateTime;
}

@ObjectType()
export class MutEntity extends BaseEntity {
  @Field()
  @Column({
    ...DateTimeColumn,
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP"
  })
  modifiedOn!: DateTime;
}
