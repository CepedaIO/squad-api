import {verify} from "./jwt";
import {Session} from "../entities/Session";
import {pick} from "lodash";
import {DateTime} from "luxon";
import {ContainerInstance} from "typedi";
import {appConfig} from "../configs/app";
import {getConnection} from "typeorm";
import {createContainer} from "./container";

export interface Context {
  container: ContainerInstance;
}
export interface SessionContext extends Context {
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
  const manager = getConnection().createEntityManager();
  
  const context:Context = {
    container: createContainer(requestId.toString(), manager)
  };

  if(appConfig.isDev && appConfig.testUsers.includes(auth)) {
    return {
      ...context,
      uuid: auth,
      key: auth,
      email: auth.toLowerCase(),
      authenticated: true
    };
  }

  if(auth) {
    try {
      const { uuid, key } = await verify(auth);

      const session = await manager.findOne(Session, {
        where: { uuid, key }
      });

      if(session) {
        if(DateTime.fromJSDate(session.expiresOn) <= DateTime.now()) {
          await manager.remove(Session, session);
        } else {
          return {
            ...context,
            ...pick(session, 'uuid', 'key', 'email', 'authenticated')
          }
        }
      }
    } catch(e) {
      throw new Error('Unable to verify auth token')
    }
  }

  return context;
}

export default context;
