import {ResolverData} from "type-graphql/dist/interfaces/ResolverData";
import {AppContext, Roles} from "../types";
import {Any, getRepository} from "typeorm";
import {Role} from "../models/Role";

export const authChecker = async ({ context: { account } }: ResolverData<AppContext>, roles: Roles[] = []) => {
  if(!account) {
    return false;
  }

  const assigned = await getRepository(Role).find({
    where: { name: Any(roles), account }
  })

  return assigned.length > 0;
}
