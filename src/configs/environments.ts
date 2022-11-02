import {env} from "node:process";

export enum Environments {
  DEV,
  TEST,
  PROD
}

export const getEnvironment = () => {
  const nodeEnv = env.NODE_ENV;
  
  if (nodeEnv === 'production') {
    return Environments.PROD;
  } else if (nodeEnv === 'test') {
    return Environments.TEST;
  }
  
  return Environments.DEV;
}
export const NODE_ENV = getEnvironment();
