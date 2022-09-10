import {Arg, Ctx, Int, Mutation, Query, Resolver} from "type-graphql";
import {SimpleResponse} from "../SimpleResponse";
import {Context, isAuthenticatedContext} from "../../utils/context";
import {DevOnly} from "../../decorators/devOnly";
import {Service} from "typedi";
import AuthService, {SessionExpiration} from "./AuthService";
import {Transaction} from "../../decorators/Transaction";

@Service()
@Resolver()
export default class AuthResolver {
  constructor(
    private authService: AuthService
  ) { }

  @Query(() => SimpleResponse, {
    description: 'Used to check if you\'re currently authenticated with services'
  })
  async authenticated(
    @Ctx() ctx: Context
  ): Promise<SimpleResponse> {
    return {success: isAuthenticatedContext(ctx), result: 'and now you know'};
  }

  @Mutation(() => SimpleResponse, {
    description: 'Consume login token and attempt to authenticate with services'
  })
  async useLoginToken(
    @Arg("uuid") uuid: string,
    @Arg("key") key: string,
    @Arg("expires", () => Int) expires: SessionExpiration,
  ): Promise<SimpleResponse> {
    return this.authService.useLoginToken(uuid, key, expires)
  }

  @DevOnly()
  @Mutation(() => SimpleResponse)
  async getNewToken(
    @Arg('email') email: string
  ): Promise<SimpleResponse> {
    return this.authService.getNewToken(email.toLowerCase());
  }

  @Transaction()
  @Mutation(() => SimpleResponse, {
    description: 'Creates an unauthenticated session and emails the login token'
  })
  async login(
    @Arg("email") email: string,
    @Ctx() ctx: Context
  ): Promise<SimpleResponse> {
    return this.authService.login(email.toLowerCase(), ctx);
  }
}
