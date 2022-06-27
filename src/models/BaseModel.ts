import {Column, Entity, Generated, PrimaryGeneratedColumn} from "typeorm";
import {Field, ObjectType} from "type-graphql";

@ObjectType()
export class BaseModel {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  @Generated('uuid')
  uuid!: string;

  @Field()
  @Column("timestamp", { default: () => "CURRENT_TIMESTAMP" })
  created!: Date;
}

export class MutBaseModel extends BaseModel {
  @Field()
  @Column("timestamp", { default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
  modified!: Date;
}
