export const appConfig = {
  port: process.env.SERVER_PORT || 8080,
  clientPort: process.env.CLIENT_PORT || 3000,
  origin: '',
  isProd: process.env.NODE_ENV === 'production',
  isDev: false,
  jwtSecret: 'w7%/L$0UE~9ukMWwA[FM%+bt:5]tKV'
}

appConfig.isDev = !appConfig.isProd
appConfig.origin = appConfig.isProd ? 'https://cepeda.io': `http://localhost:${appConfig.clientPort}`;
