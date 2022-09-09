import {verify} from "./jwt";
import {SessionEntity} from "../entities/SessionEntity";
import {pick} from "lodash";
import {DateTime} from "luxon";
import {Container, ContainerInstance} from "typedi";
import {appConfig} from "../configs/app";
import {EntityManager, getConnection} from "typeorm";

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
  const context:Context = {
    container: Container.of(requestId.toString())
  }

  const manager = getConnection().createEntityManager();
  context.container.set(EntityManager, manager);

  if(appConfig.testUsers.includes(auth) && appConfig.isDev) {
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

      const session = await manager.findOne(SessionEntity, {
        where: { uuid, key }
      });

      if(session) {
        if(DateTime.fromJSDate(session.expiresOn) <= DateTime.now()) {
          await manager.remove(SessionEntity, session);
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
