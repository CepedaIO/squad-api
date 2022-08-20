import {Arg, Ctx, Int, Mutation, Query, Resolver, UseMiddleware} from "type-graphql";
import {SimpleResponse} from "../../models/SimpleResponse";
import {Context} from "../../utils/context";
import {DevOnly} from "../../decorators/devOnly";
import login from "./login";
import getNewToken from "./getNewToken";
import useLoginToken, {SessionExpiration} from "./useLoginToken";
import authenticated from "./authenticated";

@Resolver()
export default class AuthResolver {
  @Query(() => SimpleResponse)
  async authenticated(
    @Ctx() ctx: Context
  ): Promise<SimpleResponse> {
    return authenticated(ctx);
  }

  @Mutation(() => SimpleResponse)
  async useLoginToken(
    @Arg("uuid") uuid: string,
    @Arg("token") token: string,
    @Arg("expires", () => Int) expires: SessionExpiration,
    @Ctx() ctx: Context
  ): Promise<SimpleResponse> {
    return useLoginToken(uuid, token, expires, ctx)
  }

  @Mutation(() => SimpleResponse)
  @UseMiddleware(DevOnly)
  async getNewToken(
    @Arg('email') email: string
  ): Promise<SimpleResponse> {
    return getNewToken(email);
  }

  @Mutation(() => SimpleResponse)
  async login(
    @Arg("email") email: string,
    @Ctx() ctx: Context
  ): Promise<SimpleResponse> {
    return login(email, ctx);
  }
}
