import { env } from 'node:process';
import {SnakeNamingStrategy} from "typeorm-naming-strategies";
import {ConnectionOptions} from "typeorm";
import { readFileSync } from "fs";

const postgresCert = readFileSync(env.POSTGRES_CERT);

let typeorm: ConnectionOptions = {
  type: 'postgres',
  logging: true,
  synchronize: true,
  entities:  [
    `src/entities/**/**.{ts,js}`
  ],
  namingStrategy: new SnakeNamingStrategy(),
  host: env.POSTGRES_HOST || '0.0.0.0',
  port: parseInt(env.POSTGRES_PORT || '5432'),
  username: env.POSTGRES_USER || 'superuser',
  password: env.POSTGRES_PASSWORD || 'password',
  database: env.POSTGRES_DB || 'event-matcher',
};

export const appConfig = {
  typeorm,
  port: env.SERVER_PORT || 8100,
  clientPort: env.CLIENT_PORT || 3100,
  origin: '',
  isProd: env.NODE_ENV === 'production',
  isDev: env.NODE_ENV !== 'production',
  jwtSecret: 'w7%/L$0UE~9ukMWwA[FM%+bt:5]tKV',
  fromNoReply: 'no-reply@cepeda.io',
  testUsers: [
    'cypress@cepeda.io',
    'cypress-invited@cepeda.io',
    'apollo@cepeda.io',
    'test@cepeda.io'
  ],
  emailer: {
    user: env.EMAILER_USER,
    pass: env.EMAILER_PASS
  },
  testMailer: {
    host: 'host.docker.internal',
    port: 7777,
  }
};

appConfig.origin = appConfig.isProd ? 'https://cepeda.io': `http://localhost:${appConfig.clientPort}`;
