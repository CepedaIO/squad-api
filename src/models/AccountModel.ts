import {Column, Entity, OneToMany} from "typeorm";
import {Field, InputType, ObjectType} from "type-graphql";
import {BaseModel} from "./BaseModel";
import {IsEmail} from "class-validator";
import {RoleModel} from "./RoleModel";
import {SessionModel} from "./SessionModel";

@InputType()
export class AccountInput {
  @Field()
  @IsEmail()
  email!: string;
}

@InputType()
export class LoginInput extends AccountInput {
  @Field()
  code!: string;
}


@ObjectType()
@Entity('accounts')
export class AccountModel extends BaseModel {
  @Field()
  @Column({ unique: true })
  email!: string;

  @Field()
  @Column()
  secret!: string;

  @OneToMany(() => RoleModel, (role) => role.account)
  roles: RoleModel[];

  @OneToMany(() => SessionModel, (session) =>session.account)
  sessions: SessionModel[];
}
