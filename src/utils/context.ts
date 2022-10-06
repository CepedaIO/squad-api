import {verify} from "./jwt";
import {SessionEntity} from "../entities/SessionEntity";
import {pick} from "lodash";
import {DateTime} from "luxon";
import {Container, ContainerInstance} from "typedi";
import {appConfig} from "../configs/app";
import {EntityManager, getConnection} from "typeorm";
import {createEventEntityLoaders} from "../dataloaders/EventEntity";
import {tokens} from "../tokens";
import {createInviteTokenEntityLoaders, createJoinLinkEntityLoaders} from "../dataloaders/TokenEntity";
import {createMembershipPermissionsEntityLoaders} from "../dataloaders/MembershipPermissionsEntity";
import {createAvailabilityEntityLoaders} from "../dataloaders/AvailabilityEntity";
import {createMembershipEntityLoaders} from "../dataloaders/MembershipEntity";

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
  const container =  Container.of(requestId.toString())
  
  container.set(EntityManager, manager);
  container.set(tokens.EventLoader, createEventEntityLoaders(manager));
  container.set(tokens.InviteTokenLoader, createInviteTokenEntityLoaders(manager));
  container.set(tokens.JoinLinkLoader, createJoinLinkEntityLoaders(manager));
  container.set(tokens.MembershipPermissionLoader, createMembershipPermissionsEntityLoaders(manager));
  container.set(tokens.AvailabilityLoader, createAvailabilityEntityLoaders(manager));
  container.set(tokens.MembershipLoader, createMembershipEntityLoaders(manager));

  const context:Context = {
    container,
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
