import {Arg, Ctx, Mutation, Query, Resolver} from "type-graphql";
import {SimpleResponse} from "../models/SimpleResponse";
import {Context, isAuthenticatedContext, isSessionContext} from "../services/context";
import {findAndDelete, insert, remove, save} from "../services/typeorm";
import {LoginToken} from "../models/LoginToken";
import {Session} from "../models/Session";
import {getManager} from "typeorm";
import {randomBytes} from "crypto";
import {sign} from "../services/jwt";
import {pick} from "lodash";
import {join} from "path";
import {appConfig} from "../configs/app";
import {transporter} from "../services/emailer";

@Resolver()
export class AuthResolver {
  @Query(() => SimpleResponse)
  async authenticated(
    @Ctx() ctx: Context
  ): Promise<SimpleResponse> {
    return {success: isAuthenticatedContext(ctx), result: 'and now you know'};
  }

  @Mutation(() => SimpleResponse)
  async useLoginToken(
    @Arg("uuid") uuid: string,
    @Arg("token") token: string,
    @Ctx() ctx: Context
  ): Promise<SimpleResponse> {
    if(isAuthenticatedContext(ctx)) {
      return { success: true, result: 'Already logged in, silly goose' };
    }

    try {
      const {session} = await findAndDelete(LoginToken, { uuid, token });
      await save(Session, { ...session, authenticated: true });
    } catch (e) {
      return { success: false, result: 'Go away' };
    }

    return {success: true, result: 'You\'re in baby!'};
  }

  @Mutation(() => SimpleResponse)
  async login(
    @Arg("email") email: string,
    @Ctx() ctx: Context
  ): Promise<SimpleResponse> {
    if(isAuthenticatedContext(ctx) && ctx.email === email) {
      const token = await sign(pick(ctx, 'uuid', 'key'));
      return { success: true, result: token };
    }

    const {link, token} = await getManager().transaction(async (manager) => {
      if (isSessionContext(ctx)) {
        await remove(Session, ctx, manager);
      }

      const session = await insert(Session, {
        key: randomBytes(16).toString('hex'),
        email
      }, manager);

      const login = await insert(LoginToken, {
        token: randomBytes(16).toString('hex'),
        session
      }, manager)

      const token = await sign(pick(session, 'uuid', 'key'));
      const link = join(appConfig.origin, 'login', login.uuid, login.token);

      return {link, token};
    })

    await transporter.sendMail({
      from: 'no-reply@cepeda.io',
      to: email,
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
    `
    });

    return {success: true, result: token};
  }
}
