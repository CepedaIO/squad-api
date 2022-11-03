import {Context, isAuthenticatedContext, isSessionContext} from "../../utils/context";
import {Session} from "../../entities/Session";
import {pick} from "lodash";
import {LoginTokenEntity} from "../../entities/LoginTokenEntity";
import {appConfig} from "../../configs/app";
import {Inject, Service} from "typedi";
import {SimpleResponse} from "../SimpleResponse";
import {EntityManager} from "typeorm";
import {HTMLService} from "../../services/HTMLService";
import {registerEnumType} from "type-graphql";
import SessionService from "../../services/SessionService";
import {createKey} from "../../utils/bag";
import {Transporter} from "nodemailer";
import {tokens} from "../../utils/container";

export enum SessionExpiration {
  ONE_HOUR,
  ONE_WEEK
}

registerEnumType(SessionExpiration, {
  name: 'SessionExpiration',
  description: 'Available session expiration options'
});

@Service()
export default class AuthService {
  constructor(
    private manager: EntityManager,
    private htmlService: HTMLService,
    private sessionService: SessionService,
    @Inject(tokens.Transporter) private emailer: Transporter
  ) {}

  async getNewToken(email: string): Promise<SimpleResponse> {
    const session = await this.sessionService.createShortSession(email);
    return {
      success: true,
      result: await this.sessionService.toJWT(session)
    };
  }

  async login(email: string, ctx: Context) {
    if (isAuthenticatedContext(ctx) && ctx.email === email) {
      const token = await this.sessionService.toJWT(ctx);
      return {success: true, result: token};
    }

    if (isSessionContext(ctx)) {
      await this.manager.delete(Session, pick(ctx, 'uuid', 'key'));
    }

    const session = await this.sessionService.createShortSession(email);
    const login = await this.manager.save(LoginTokenEntity, {
      key: createKey(),
      session
    });
    
    await this.emailer.sendMail({
      from: appConfig.fromNoReply,
      to: email,
      subject: 'Login request to CepedaIO/Squad!',
      html: this.htmlService.login(login)
    });

    return {
      success: true,
      result: await this.sessionService.toJWT(session)
    };
  }

  async useLoginToken(uuid:string, key:string, expires:SessionExpiration) {
    try {
      const {session} = await this.manager.findOneOrFail(LoginTokenEntity, { uuid, key });
      await this.manager.delete(Session, session);
      await this.manager.delete(LoginTokenEntity, { uuid, key });

      const authenticated = await this.sessionService.authenticateSession(session, expires);
      return {
        success: true,
        result: await this.sessionService.toJWT(authenticated)
      };
    } catch (e) {
      return { success: false, result: 'Go away' };
    }
  }
}
