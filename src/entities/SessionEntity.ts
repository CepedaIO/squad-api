import {Column, Entity, Generated} from "typeorm";
import {MutEntity} from "./BaseEntity";
import {Field} from "type-graphql";

@Entity('sessions')
export class SessionEntity extends MutEntity {
  @Field()
  @Column()
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
