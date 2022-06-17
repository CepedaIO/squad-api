import {Arg, Authorized, Mutation, Query, Resolver} from "type-graphql";
import {AccountModel, AccountInput, LoginInput} from "../models/AccountModel";
import {getRepository} from "typeorm";
import QRCode from "qrcode";
import { authenticator } from "otplib";
import {SimpleResponse} from "../models/common";
import jwt from "jsonwebtoken";
import {appConfig} from "../configs/app";
import * as crypto from "crypto";
import {SessionModel} from "../models/SessionModel";

@Resolver(AccountModel)
export class AccountResolver {
  @Query(() => [AccountModel])
  @Authorized(['ADMIN'])
  async accounts() {
    return getRepository(AccountModel).find({
      take: 10
    });
  }

  @Query(() => SimpleResponse)
  async getQRCode(
    @Arg("account") input: AccountInput
  ): Promise<SimpleResponse> {
    const account = await getRepository(AccountModel).findOneOrFail({ where: input });
    const key = authenticator.keyuri(input.email, 'CepedaIO Event Matcher', account.secret);
    const url = await QRCode.toDataURL(key);

    return { success: true, result: url };
  }

  @Query(() => SimpleResponse)
  async login(
    @Arg("auth") input: LoginInput
  ): Promise<SimpleResponse> {
    const account = await getRepository(AccountModel).findOneOrFail({
      where: { email: input.email }
    });
    const isAuthenticated = authenticator.check(input.code, account.secret);

    if(!isAuthenticated) {
      return { success: false, result: 'Failed to login' };
    }

    const sessionSecret = crypto.randomBytes(16).toString('hex');
    await getRepository(SessionModel).insert({
      secret: sessionSecret,
      account
    })

    const emailToken = jwt.sign(sessionSecret, account.secret);
    const token = jwt.sign({
      email: account.email,
      token: emailToken
    }, appConfig.jwtSecret);

    return { success: true, result: token };
  }

  @Mutation(() => SimpleResponse)
  async createAccount(
    @Arg("account") input: AccountInput,
  ): Promise<SimpleResponse> {
    const accountRepo = getRepository(AccountModel);
    const account = await accountRepo.findOne({
      where: { email: input.email }
    });

    if(account) {
      return { success: true, result: 'Account Exists!'};
    }

    const secret = authenticator.generateSecret();
    await getRepository(AccountModel).insert({
      ...input,
      secret
    });

    return { success: true, result: 'Account Created!' };
  }
}
