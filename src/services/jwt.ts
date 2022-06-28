import jwt from "jsonwebtoken";
import {appConfig} from "../configs/app";
import {Session} from "../models/Session";
import {Account} from "../models/Account";

export type JWTToken = string;
export interface JWT {
  account: Pick<Account, 'uuid'>
  session: Pick<Session, 'uuid' | 'key'>
}

export const sign = (obj: JWT) => jwt.sign(obj, appConfig.jwtSecret);
export const verify = (token: string) => jwt.verify(token, appConfig.jwtSecret) as JWT
