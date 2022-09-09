import {Context, isAuthenticatedContext, isSessionContext} from "../../utils/context";
import {SessionEntity} from "../../entities/SessionEntity";
import {randomBytes} from "crypto";
import {DateTime} from "luxon";
import {sign} from "../../utils/jwt";
import {pick} from "lodash";
import {LoginTokenEntity} from "../../entities/LoginTokenEntity";
import {appConfig} from "../../configs/app";
import {Service} from "typedi";
import {SimpleResponse} from "../SimpleResponse";
import {EntityManager} from "typeorm";
import {HTMLService} from "../../services/HTMLService";
import {providers} from "../../providers";

export enum SessionExpiration {
  ONE_HOUR,
  ONE_WEEK
}

@Service()
export default class AuthService {
  constructor(
    private manager: EntityManager,
    private htmlService: HTMLService
  ) {}

  async getNewToken(email: string): Promise<SimpleResponse> {
    const session = await this.manager.save(SessionEntity, {
      key: randomBytes(16).toString('hex'),
      email,
      authenticated: true,
      expiresOn: DateTime.now().plus({
        minutes: 5
      })
    });

    const token = await sign(pick(session, 'uuid', 'key'));

    return {success: true, result: token};
  }

  async login(email: string, ctx: Context) {
    if (isAuthenticatedContext(ctx) && ctx.email === email) {
      const token = await sign(pick(ctx, 'uuid', 'key'));
      return {success: true, result: token};
    }

    if (isSessionContext(ctx)) {
      await this.manager.remove(SessionEntity, pick(ctx, 'uuid', 'key'));
    }

    const session = await this.manager.save(SessionEntity, {
      key: randomBytes(16).toString('hex'),
      email,
      expiresOn: DateTime.now().plus({
        minutes: 10
      })
    });

    const login = await this.manager.save(LoginTokenEntity, {
      key: randomBytes(16).toString('hex'),
      session
    })

    const token = await sign(pick(session, 'uuid', 'key'));
    const emailer = providers.emailerFor(email);

    await emailer.sendMail({
      from: appConfig.fromNoReply,
      to: email,
      subject: 'Login request to CepedaIO/Event-Matcher!',
      html: this.htmlService.login(login)
    });

    return {success: true, result: token};
  }

  async useLoginToken(uuid:string, key:string, expires:SessionExpiration, ctx: Context) {
    if(isAuthenticatedContext(ctx)) {
      return { success: true, result: 'Already logged in, silly goose' };
    }

    try {
      const {session} = await this.manager.findOneOrFail(LoginTokenEntity, { uuid, key });
      await this.manager.delete(LoginTokenEntity, { uuid, key });
      const expiresOn = expires === SessionExpiration.ONE_HOUR ? DateTime.now().plus({ hour:1 }) : DateTime.now().plus({ weeks:2 })

      await this.manager.save(SessionEntity, {
        ...session,
        authenticated: true,
        expiresOn
      });
    } catch (e) {
      return { success: false, result: 'Go away' };
    }

    return {success: true, result: 'You\'re in baby!'};
  }
}
