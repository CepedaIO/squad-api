import {Column, Entity, Generated} from "typeorm";
import {MutEntity} from "./BaseEntity";
import {Field} from "type-graphql";

@Entity('sessions')
export class SessionEntity extends MutEntity {
  @Column()
  @Generated('uuid')
  uuid!: string;

  @Column({ unique: true, nullable: false })
  key: string;
  
  @Field()
  @Column({ nullable: false})
  email: string;

  @Field()
  @Column({ default: false })
  authenticated: boolean;
  
  @Field()
  @Column({ nullable: false })
  expiresOn: Date
}
