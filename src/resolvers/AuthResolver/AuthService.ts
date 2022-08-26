import {Context, isAuthenticatedContext, isSessionContext} from "../../utils/context";
import {Database} from "../../utils/typeorm";
import {Session} from "../../models/Session";
import {randomBytes} from "crypto";
import {DateTime} from "luxon";
import {sign} from "../../utils/jwt";
import {pick} from "lodash";
import {LoginToken} from "../../models/LoginToken";
import {URL} from "url";
import {appConfig} from "../../configs/app";
import {join} from "path";
import {transporter} from "../../utils/emailer";
import {Service} from "typedi";
import {SimpleResponse} from "../../models/SimpleResponse";

export enum SessionExpiration {
  ONE_HOUR,
  ONE_WEEK
}

@Service()
export default class AuthService {
  constructor(
    private db: Database
  ) {}

  async getNewToken(email: string): Promise<SimpleResponse> {
    const session = await this.db.insert(Session, {
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
      await this.db.remove(Session, pick(ctx, 'uuid', 'key'));
    }

    const session = await this.db.insert(Session, {
      key: randomBytes(16).toString('hex'),
      email,
      expiresOn: DateTime.now().plus({
        minutes: 10
      })
    });

    const login = await this.db.insert(LoginToken, {
      token: randomBytes(16).toString('hex'),
      session
    })

    const token = await sign(pick(session, 'uuid', 'key'));
    const url = new URL(appConfig.origin)
    url.pathname = join('login-with', login.uuid, login.token);
    const link = url.toString();

    await transporter.sendMail({
      from: 'no-reply@cepeda.io',
      to: email,
      subject: 'Login request to CepedaIO/Event-Matcher!',
      html: `
<html>
  <body>
    <h1>Thank you for joining!</h1>
    
    <p>
      That's about it! If you have any questions or run into any bugs, reach out to <a style="color:#3b83f6;text-decoration:underline;cursor:pointer" href = "mailto:support@cepeda.io">support@cepeda.io</a>
    </p>
    <p>
      How would you like to log in?
    </p>
    <ul style="list-style: none">
      <li style="margin-bottom:10px">
        <a href="${link}?expires=0">
          <button style="background-color:#3b83f6;color:white;width:165px;height:40px;cursor:pointer;border:0;">Expire after 1 hour</button>
        </a>
      </li>
      <li style="margin-bottom:10px">
        <a href="${link}?expires=1">
          <button style="background-color:#3b83f6;color:white;width:165px;height:40px;cursor:pointer;border:0;">Expire after 2 weeks</button>
        </a>
      </li>
      <li style="margin-bottom:10px">
        <a href="${link}?reject=true">
          <button style="background-color:#fb7186;color:white;width:165px;height:40px;cursor:pointer;border:0;">Don't Login</button>
        </a>
      </li>
    </ul>
  </body>
</html>
    `
    });

    return {success: true, result: token};
  }

  async useLoginToken(uuid:string, token:string, expires:SessionExpiration, ctx: Context) {
    if(isAuthenticatedContext(ctx)) {
      return { success: true, result: 'Already logged in, silly goose' };
    }

    try {
      const {session} = await this.db.findAndDelete(LoginToken, { uuid, token });
      const expiresOn = expires === SessionExpiration.ONE_HOUR ? DateTime.now().plus({ hour:1 }) : DateTime.now().plus({ weeks:2 })

      await this.db.save(Session, {
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
