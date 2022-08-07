import {verify} from "./jwt";
import {Session} from "../models/Session";
import {findOne, remove} from "./typeorm";
import {pick} from "lodash";
import {DateTime} from "luxon";
import {createConnection} from "typeorm";

export interface Context { }
export interface SessionContext {
  uuid: string;
  key: string;
  email: string;
  authenticated: boolean;
}

export interface AuthenticatedContext extends SessionContext {
  authenticated: true
}

export const isSessionContext = (obj:any): obj is SessionContext => {
  return !!obj.email && !!obj.uuid;
}

export const isAuthenticatedContext = (obj:any): obj is AuthenticatedContext => {
  return isSessionContext(obj) && obj['authenticated'] === true;
}

export const context = async ({ req }): Promise<Context | SessionContext> => {
  await createConnection();
  const auth = req.headers.authorization || '';

  if(!!auth) {
    const jwt = await verify(auth);

    /**
     * Replace by memcache or other in-memory lookup
     */
    const session = await findOne(Session, {
      where: pick(jwt, 'uuid', 'key')
    });

    if(session) {
      if(DateTime.fromJSDate(session.expiresOn) <= DateTime.now()) {
        await remove(Session, session);
        return {};
      }

      return pick(session, 'uuid', 'key', 'email', 'authenticated');
    }
  }

  return { };
}
