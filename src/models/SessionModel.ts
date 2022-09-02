import {Column, Entity, Generated} from "typeorm";
import {MutBaseModel} from "./BaseModel";
import {Field} from "type-graphql";

@Entity('sessions')
export class SessionModel extends MutBaseModel {
  @Field()
  @Generated('uuid')
  uuid!: string;

  @Column({ unique: true, nullable: false })
  key: string;

  @Column({ nullable: false})
  email: string;

  @Column({ default: false })
  authenticated: boolean;

  @Column({ nullable: false })
  expiresOn: Date
}
