import {Column, Entity, Generated, PrimaryGeneratedColumn} from "typeorm";
import {Field, ObjectType} from "type-graphql";

@ObjectType()
@Entity()
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

  @Field()
  @Column("timestamp", { default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
  modified!: Date;
}
