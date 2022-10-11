import {BaseEntity} from "./BaseEntity";
import {Column, Entity, Generated, JoinColumn, OneToOne} from "typeorm";
import {Session} from "./Session";

@Entity('login_tokens')
export class LoginTokenEntity extends BaseEntity {
  @Column()
  @Generated('uuid')
  uuid!: string;

  @Column({ nullable: false })
  key: string;

  @OneToOne(() => Session, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  public session: Session;
}
