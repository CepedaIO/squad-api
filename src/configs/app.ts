import './environments';
import {env} from 'node:process';
import {SnakeNamingStrategy} from "typeorm-naming-strategies";
import {ConnectionOptions} from "typeorm";
import AuthResolver from "../resolvers/AuthResolver";
import UserQueries from "../resolvers/UserResolver/queries";
import EventQueries from "../resolvers/EventResolver/queries";
import EventMutations from "../resolvers/EventResolver/mutations";
import MembershipQueries from "../resolvers/MembershipResolver/queries";
import InviteTokenQueries from "../resolvers/InviteResolver/queries";
import JoinLinkQueries from "../resolvers/JoinLinkResolver/queries";
import JoinLinkMutations from "../resolvers/JoinLinkResolver/mutations";
import PendingMembershipQueries from "../resolvers/PendingMembershipResolver/queries";
import PendingMembershipMutations from "../resolvers/PendingMembershipResolver/mutations";
import GeneralQueries from "../resolvers/GeneralResolver/queries";
import {NonEmptyArray} from "type-graphql";
import {Environments, NODE_ENV} from "./environments";
import {createTransport} from "nodemailer";
import {tokens} from "../utils/container";
import {Container} from "typedi";

const entities = NODE_ENV === Environments.PROD ? 'dist/entities/**/**.{js,ts}' : 'src/entities/**/**.{js,ts}';

let typeorm: ConnectionOptions = {
  type: 'postgres',
  logging: NODE_ENV !== Environments.PROD,
  synchronize: true,
  entities:  [ entities ],
  namingStrategy: new SnakeNamingStrategy(),
  host: env.POSTGRES_HOST || 'localhost',
  port: parseInt(env.POSTGRES_PORT || '5432'),
  username: env.POSTGRES_USER || 'superuser',
  password: env.POSTGRES_PASSWORD || 'password',
  database: env.POSTGRES_DB || 'event-matcher',
};

export const appConfig = {
  typeorm,
  port: env.SERVER_PORT || 8100,
  hostname: env.HOSTNAME,
  clientURL: env.CLIENT_URL,
  jwtSecret: env.JWT_SECRET,
  fromNoReply: env.NO_REPLY_ADDRESS,
  resolvers: [
    AuthResolver, UserQueries,
    EventQueries, EventMutations,
    MembershipQueries,
    InviteTokenQueries,
    JoinLinkQueries, JoinLinkMutations,
    PendingMembershipQueries, PendingMembershipMutations,
    GeneralQueries
  ] as NonEmptyArray<Function>,
  transporter: createTransport({
    service: 'gmail',
    auth: {
      user: env.EMAILER_USER,
      pass: env.EMAILER_PASS
    }
  })
};

console.log('Is Prod?', NODE_ENV === Environments.PROD);
console.log('Typeorm:', appConfig.typeorm);
