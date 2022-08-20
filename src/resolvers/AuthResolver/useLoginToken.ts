import {Context, isAuthenticatedContext} from "../../utils/context";
import {findAndDelete, save} from "../../utils/typeorm";
import {LoginToken} from "../../models/LoginToken";
import {DateTime} from "luxon";
import {Session} from "../../models/Session";

export enum SessionExpiration {
  ONE_HOUR,
  ONE_WEEK
}

export default async function useLoginToken(uuid:string, token:string, expires:SessionExpiration, ctx: Context) {
  if(isAuthenticatedContext(ctx)) {
    return { success: true, result: 'Already logged in, silly goose' };
  }

  try {
    const {session} = await findAndDelete(LoginToken, { uuid, token });
    const expiresOn = expires === SessionExpiration.ONE_HOUR ? DateTime.now().plus({ hour:1 }) : DateTime.now().plus({ weeks:2 })

    await save(Session, {
      ...session,
      authenticated: true,
      expiresOn
    });
  } catch (e) {
    return { success: false, result: 'Go away' };
  }

  return {success: true, result: 'You\'re in baby!'};
}
