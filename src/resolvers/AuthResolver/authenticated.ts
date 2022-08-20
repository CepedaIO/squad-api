import {Context, isAuthenticatedContext} from "../../utils/context";

export default async function authenticated(ctx: Context) {
  return {success: isAuthenticatedContext(ctx), result: 'and now you know'};
}
