import {verify} from "./jwt";
import {SessionEntity} from "../entities/SessionEntity";
import {findOne, remove} from "./typeorm";
import {pick} from "lodash";
import {DateTime} from "luxon";
import {Container, ContainerInstance} from "typedi";
import {appConfig} from "../configs/app";
import {EntityManager, getConnection} from "typeorm";
import {tokens} from "../tokens";
import {emailer, testEmailer} from "./emailer";

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

  context.container.set(EntityManager, getConnection().createEntityManager());
  context.container.set(tokens.Emailer, emailer);

  if(auth === 'test@cepeda.io' && appConfig.isDev) {
    context.container.set(tokens.Emailer, testEmailer);

    return {
      ...context,
      uuid: 'test@cepeda.io',
      key: 'test@cepeda.io',
      email: 'test@cepeda.io',
      authenticated: true
    };
  }

  if(auth) {
    const jwt = await verify(auth);
    const session = await findOne(SessionEntity, {
      where: pick(jwt, 'uuid', 'key')
    });

    if(session) {
      if(DateTime.fromJSDate(session.expiresOn) <= DateTime.now()) {
        await remove(SessionEntity, session);
      } else {
        return {
          ...context,
          ...pick(session, 'uuid', 'key', 'email', 'authenticated')
        }
      }
    }
  }

  return context;
}

export default context;
