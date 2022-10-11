import {Service} from "typedi";
import {EntityManager} from "typeorm";
import {DateTime} from "luxon";
import {Session} from "../entities/Session";
import {SessionExpiration} from "../resolvers/AuthResolver/AuthService";
import {createKey} from "../utils/bag";
import {JWTToken, sign} from "../utils/jwt";
import {pick} from "lodash";

@Service()
export default class SessionService {
  constructor(
    private manager: EntityManager
  ) {}

  async toJWT(ctx: { uuid: string, key: string }): Promise<JWTToken> {
    return sign(pick(ctx, 'uuid', 'key'));
  }

  async authenticateSession(session: Session, expires: SessionExpiration): Promise<Session> {
    const expiresOn = expires === SessionExpiration.ONE_HOUR ? DateTime.now().plus({ hour:1 }) : DateTime.now().plus({ weeks:2 })

    return this.manager.save(Session, {
      ...session,
      expiresOn,
      authenticated: true
    });
  }

  async createSession(data: {
    email: string, expires: SessionExpiration, authenticated?: boolean
  }): Promise<Session> {
    const expiresOn = data.expires === SessionExpiration.ONE_HOUR ? DateTime.now().plus({ hour:1 }) : DateTime.now().plus({ weeks:2 })

    return this.manager.save(Session, {
      email: data.email,
      key: createKey(),
      authenticated: !!data.authenticated,
      expiresOn
    });
  }

  async createShortSession(email: string, authenticated: boolean = false): Promise<Session> {
    return this.manager.save(Session, {
      key: createKey(),
      email,
      expiresOn: DateTime.now().plus({
        minutes: 20
      }),
      authenticated
    })
  }
}
