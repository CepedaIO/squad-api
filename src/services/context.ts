import {verify, JWT} from "./jwt";
import {getRepository} from "typeorm";
import {Session} from "../models/Session";
import {Account} from "../models/Account";
import {findOneOrFail} from "./typeorm";
import {pick} from "lodash";

export interface Context { }
export interface SessionContext {
  account: JWT['account']
  session: JWT['session']
}

export type AuthenticatedContext = SessionContext & {
  session: { authenticated:true }
}

export const isSessionContext = (obj:any): obj is SessionContext => {
  return !!obj.account && !!obj.session;
}

export const isAuthenticatedContext = (obj:any): obj is AuthenticatedContext => {
  return isSessionContext(obj) && obj.session['authenticated'] === true;
}

const context = async ({ req }): Promise<Context | SessionContext> => {
  const auth = req.headers.authorization || '';

  if(!!auth) {
    const jwt = await verify(auth);

    /**
     * Replace by memcache or other in-memory lookup
     */
    const session = await findOneOrFail(Session, { where: jwt.session });
    const account = await findOneOrFail(Account, { where: jwt.account });

    return {
      account: pick(account, 'uuid'),
      session: pick(session, 'uuid', 'key', 'authenticated') };
  }

  return { };
}

export default context;
