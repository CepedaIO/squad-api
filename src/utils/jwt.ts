import jwt from "jsonwebtoken";
import {appConfig} from "../configs/app";

export type JWTToken = string;
export interface JWT {
  key: string;
}

export const sign = (obj: JWT): JWTToken => jwt.sign(obj, appConfig.jwtSecret);
export const verify = (token: JWTToken): JWT => jwt.verify(token, appConfig.jwtSecret) as JWT
