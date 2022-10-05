import { env } from 'node:process';
import {SnakeNamingStrategy} from "typeorm-naming-strategies";
import {ConnectionOptions} from "typeorm";

const isProd = env.NODE_ENV === 'production';
const isDev = !isProd;
const entities = isProd ? 'dist/entities/**/**.{js,ts}' : 'src/entities/**/**.{js,ts}'

let typeorm: ConnectionOptions = {
  type: 'postgres',
  logging: isDev,
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
  isProd,
  isDev,
  port: env.SERVER_PORT || 8100,
  origin: '',
  jwtSecret: 'w7%/L$0UE~9ukMWwA[FM%+bt:5]tKV',
  fromNoReply: 'no-reply@cepeda.io',
  emailer: {
    user: env.EMAILER_USER,
    pass: env.EMAILER_PASS
  },
  testUsers: null,
  testMailer: null
};

if(isDev) {
  appConfig.testUsers = [
    'cypress@cepeda.io',
    'cypress-invited@cepeda.io',
    'cypress-invited2@cepeda.io',
    'apollo@cepeda.io',
    'test@cepeda.io'
  ];

  appConfig.testMailer = {
    host: 'localhost',
    port: 7777,
  };
}

appConfig.origin = isProd ? 'https://squad.cepeda.io': `http://localhost:3100`;
