import {Service} from "typedi";
import {EntityManager} from "typeorm";
import {DateTime} from "luxon";
import {SessionEntity} from "../entities/SessionEntity";
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

  async authenticateSession(session: SessionEntity, expires: SessionExpiration): Promise<SessionEntity> {
    const expiresOn = expires === SessionExpiration.ONE_HOUR ? DateTime.now().plus({ hour:1 }) : DateTime.now().plus({ weeks:2 })

    return this.manager.save(SessionEntity, {
      ...session,
      expiresOn,
      authenticated: true
    });
  }

  async createSession(data: {
    email: string, expires: SessionExpiration, authenticated?: boolean
  }): Promise<SessionEntity> {
    const expiresOn = data.expires === SessionExpiration.ONE_HOUR ? DateTime.now().plus({ hour:1 }) : DateTime.now().plus({ weeks:2 })

    return this.manager.save(SessionEntity, {
      email: data.email,
      key: createKey(),
      authenticated: !!data.authenticated,
      expiresOn
    });
  }

  async createShortSession(email: string, authenticated: boolean = false): Promise<SessionEntity> {
    return this.manager.save(SessionEntity, {
      key: createKey(),
      email,
      expiresOn: DateTime.now().plus({
        minutes: 20
      }),
      authenticated
    })
  }
}
