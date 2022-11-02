import {Entity, JoinColumn, OneToOne} from "typeorm";
import {MutEntity} from "../../entities/BaseEntity";
import {Session} from "../../entities/Session";
import {appConfig} from "../app";
import {env} from "node:process";
import {createTransport} from "nodemailer";
import {TestResolver} from "./TestResolver";
import {Environments, NODE_ENV} from "../environments";

@Entity('test_sessions')
export class TestSession extends MutEntity {
  @OneToOne(
    () => Session,
    { nullable:false, onDelete:'CASCADE' }
  )
  @JoinColumn()
  session: Session;
}

if(NODE_ENV === Environments.TEST) {
  appConfig.typeorm.entities.push(TestSession);
  appConfig.resolvers = [...appConfig.resolvers, TestResolver];
  const options = {
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT)
  };
  appConfig.transporter = createTransport(options);
}
