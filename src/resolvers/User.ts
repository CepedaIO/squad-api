import {Query, Resolver} from "type-graphql";
import {User} from "../models/User";
import {getRepository} from "typeorm";

@Resolver(User)
export class UserResolver {
  @Query(() => [User])
  async users() {
    return getRepository(User).find({
      take: 10
    });
  }
}
