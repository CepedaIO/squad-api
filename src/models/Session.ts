import {Column, Entity} from "typeorm";
import {MutBaseModel} from "./BaseModel";

@Entity('sessions')
export class Session extends MutBaseModel {
  @Column({ unique: true, nullable: false })
  key: string;

  @Column({ nullable: false})
  email: string;

  @Column({ default: false })
  authenticated: boolean;

  @Column({ nullable: false })
  expiresOn: Date
}
