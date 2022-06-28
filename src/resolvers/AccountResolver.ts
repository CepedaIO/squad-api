import {Arg, Authorized, Ctx, Mutation, Query, Resolver} from "type-graphql";
import {Account, LoginInput} from "../models/Account";
import {getManager, getRepository} from "typeorm";
import {SimpleResponse} from "../models/common";
import {transporter} from "../services/emailer";
import {randomBytes} from "crypto";
import {PendingSignup} from "../models/PendingSignup";
import {LoginToken} from "../models/LoginToken";
import { appConfig } from "../configs/app";
import { join } from "path";
import {Session} from "../models/Session";
import {sign} from "../services/jwt";
import {pick} from "lodash";
import {Context, isAuthenticatedContext, isSessionContext} from "../services/context";
import {remsert, findOne, insert, remove, findOneOrFail, save} from "../services/typeorm";

@Resolver(Account)
export class AccountResolver {
  @Query(() => [Account])
  @Authorized(['ADMIN'])
  async accounts() {
    return getRepository(Account).find({
      take: 10
    });
  }
/*
  @Query(() => SimpleResponse)
  async getQRCode(
    @Arg("account") input: AccountInput
  ): Promise<SimpleResponse> {
    const account = await getRepository(Account).findOneOrFail({ where: input });
    const key = authenticator.keyuri(input.email, 'CepedaIO Event Matcher', account.secret);
    const url = await QRCode.toDataURL(key);

    return { success: true, result: url };
  }*/

  @Query(() => SimpleResponse)
  async authenticated(
    @Ctx() ctx: Context
  ): Promise<SimpleResponse> {
    return { success: isAuthenticatedContext(ctx) , result: 'and now you know' };
  }

  @Mutation(() => SimpleResponse)
  async useLoginToken(
    @Arg("uuid") uuid: string,
    @Arg("token") token: string,
    @Ctx() ctx: Context
  ): Promise<SimpleResponse> {
    if(!isSessionContext(ctx)) {
      return { success: false, result: 'No session, no access!' };
    }

    const { session } = await findOneOrFail(LoginToken, {
      where: { uuid, token },
      relations: ['session']
    });

    await save(Session, {
      ...session,
      authenticated: true
    });

    return { success: true, result: 'You\'re in baby!' };
  }

  @Mutation(() => SimpleResponse)
  async login(
    @Arg("auth") input: LoginInput,
    @Ctx() ctx: Context
  ): Promise<SimpleResponse> {
    let account = await findOne(Account, { where: input });

    if(!account) {
      account = await insert(Account, { email: input.email });
      await insert(PendingSignup, { account });
    }

    const { link, token } = await getManager().transaction(async (manager) => {
      if(isSessionContext(ctx)) {
        await remove(Session, { account, ...ctx.session }, manager);
        await remove(LoginToken, { account, session: ctx.session }, manager);
      }

      const session = await insert(Session, {
        key: randomBytes(16).toString('hex'),
        account
      }, manager);

      const login = await insert(LoginToken, {
        token: randomBytes(16).toString('hex'),
        account,
        session
      }, manager)

      const token = await sign({
        account: pick(account!, 'uuid'),
        session: pick(session, 'uuid', 'key')
      })

      const link = join(appConfig.origin, 'login', login.uuid, login.token);

      return { link, token };
    })

    await transporter.sendMail({
      from: 'no-reply@cepeda.io',
      to: input.email,
      subject: 'Welcome to CepedaIO/Event-Matcher!',
      html: `
<html>
  <body>
    <h1>Thank you for joining!</h1>
    
    <p>
      That's about it! If you have any questions or run into any bugs, reach out to <a style="color:#3b83f6;text-decoration:underline;cursor:pointer" href = "mailto:support@cepeda.io">support@cepeda.io</a>
    </p>
    <p>
      How would you like to login?
    </p>
    <ul style="list-style: none">
      <li style="margin-bottom:10px">
        <a href="${link}">
          <button style="background-color:#3b83f6;color:white;width:165px;height:40px;cursor:pointer;border:0;">Expire after infinity</button>
        </a>
      </li>
      <li style="margin-bottom:10px">
        <a href="${link}?expire=1">
          <button style="background-color:#3b83f6;color:white;width:165px;height:40px;cursor:pointer;border:0;">Expire after 1 hour</button>
        </a>
      </li>
      <li style="margin-bottom:10px">
        <a href="${link}?reject=true">
          <button style="background-color:#fb7186;color:white;width:165px;height:40px;cursor:pointer;border:0;">Don't Login</button>
        </a>
       </li>
    </ul>
    <sub>
      Note: Expire after infinity means that after an infinite amount of time has passed, you will be prompted to login again.
      <br />
      This is a good choice if you're using a personal computer
    </sub>
  </body>
</html>
    `});

    return { success: true, result: token };
/*
    if(!isAuthenticated) {
      return { success: false, result: 'Failed to login' };
    }

    const sessionKey = crypto.randomBytes(16).toString('hex');
    const session = await getRepository(Session).save({
      key: sessionKey,
      account
    });

    const result = await compress({
      account: pick(account, 'uuid', 'email'),
      session
    }, account.secret);
*/
  }
/*
  @Mutation(() => SimpleResponse)
  async createAccount(
    @Arg("account") input: AccountInput,
  ): Promise<SimpleResponse> {
    const accountRepo = getRepository(Account);
    const account = await accountRepo.findOne({
      where: { email: input.email }
    });

    if(account) {
      return { success: true, result: 'Account Exists!'};
    }

    const secret = authenticator.generateSecret();
    await getRepository(Account).insert({
      ...input,
      secret
    });

    return { success: true, result: 'Account Created!' };
  }*/
}
