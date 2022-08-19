import { env } from 'node:process';

export const appConfig = {
  port: env.SERVER_PORT || 8080,
  clientPort: env.CLIENT_PORT || 3000,
  origin: '',
  isProd: env.NODE_ENV === 'production',
  isDev: false,
  jwtSecret: 'w7%/L$0UE~9ukMWwA[FM%+bt:5]tKV',
  emailer: {
    user: env.EMAILER_USER,
    pass: env.EMAILER_PASS
  },
  testMailer: {
    host: 'host.docker.internal',
    port: 7777,

  }
}

appConfig.isDev = !appConfig.isProd;
appConfig.origin = appConfig.isProd ? 'https://cepeda.io': `http://localhost:${appConfig.clientPort}`;
