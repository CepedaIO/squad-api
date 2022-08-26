import {Column, Generated, PrimaryGeneratedColumn} from "typeorm";
import {Field, ObjectType} from "type-graphql";

@ObjectType()
export abstract class BaseModel {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column("timestamp", { default: () => "CURRENT_TIMESTAMP" })
  createdOn!: Date;
}

@ObjectType()
export class MutBaseModel extends BaseModel {
  @Field()
  @Column("timestamp", { default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
  modifiedOn!: Date;
}
