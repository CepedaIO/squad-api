import {Column, Entity} from "typeorm";
import {BaseModel} from "./BaseModel";

@Entity('sessions')
export class Session extends BaseModel {
  @Column({ unique: true, nullable: false })
  key: string;

  @Column({ nullable: false})
  email: string;

  @Column({ default: false })
  authenticated: boolean;

  @Column({ nullable: false })
  expiresOn: Date
}
