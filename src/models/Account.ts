import {Column, Entity, OneToMany} from "typeorm";
import {Field, InputType, ObjectType} from "type-graphql";
import {BaseModel} from "./BaseModel";
import {IsEmail} from "class-validator";
import {Role} from "./Role";
import {Session} from "./Session";

@InputType()
export class AccountInput {
  @Field()
  @IsEmail()
  email!: string;
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email!: string;
}

@ObjectType()
@Entity('accounts')
export class Account extends BaseModel {
  @Field()
  @Column({ unique: true })
  email!: string;

  @OneToMany(() => Role, (role) => role.account)
  roles: Role[];

  @OneToMany(() => Session, (session) => session.account)
  sessions: Session[];
}
