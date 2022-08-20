import {verify} from "./jwt";
import {Session} from "../models/Session";
import {findOne, remove} from "./typeorm";
import {pick} from "lodash";
import {DateTime} from "luxon";
import {Container, ContainerInstance} from "typedi";

export interface Context {
  container: ContainerInstance;
}
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

const context = async ({ req }): Promise<Context | SessionContext> => {
  const auth = req.headers.authorization || '';
  const requestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  const container = Container.of(requestId.toString());
  const context:Context = {
    container: container
  }

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
        return context;
      }

      return {
        ...context,
        ...pick(session, 'uuid', 'key', 'email', 'authenticated')
      }
    }
  }

  return context;
}

export default context;
