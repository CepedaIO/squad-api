import {Column, Generated, PrimaryGeneratedColumn} from "typeorm";
import {Field, ObjectType} from "type-graphql";

@ObjectType()
export abstract class BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column("timestamp", { default: () => "CURRENT_TIMESTAMP" })
  createdOn!: Date;
}

@ObjectType()
export class MutEntity extends BaseEntity {
  @Field()
  @Column("timestamp", { default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
  modifiedOn!: Date;
}
