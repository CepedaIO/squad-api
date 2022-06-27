import { gzip, unzip } from 'zlib';
import jwt from "jsonwebtoken";
import {appConfig} from "../configs/app";
import {getRepository} from "typeorm";
import {Account} from "../models/Account";

export interface JWT {
  account: {
    uuid: string;
    email: string;
  }

  session: {
    id: number;
    key: string;
  }
}

export const compress = (obj: JWT, secret: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const sessionSecret = jwt.sign(obj.session, secret);
    const token = jwt.sign({
      account: obj.account,
      session: sessionSecret
    }, appConfig.jwtSecret);

    gzip(token, (err, buffer) => {
      if(err) return reject(err);
      const result = buffer.toString('utf-8');
      resolve(result);
    });
  });
};

export const decompress = (gzipped: string): Promise<JWT> => {
  return new Promise((resolve, reject) => {
    unzip(gzipped, async (err, buffer) => {
      if(err) return reject(err);

      try{
        const token = buffer.toString('utf-8');
        const partial = jwt.verify(token, appConfig.jwtSecret) as JWT;
        const account = await getRepository(Account).findOneOrFail({
          where: partial.account
        });
        // @ts-ignore
        const session = await jwt.verify(partial.session, account.secret);

        resolve({
          account: partial.account,
          session
        });
      } catch(e) {
        reject(e);
      }
    })
  });
}
