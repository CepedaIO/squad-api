import {ResolverData} from "type-graphql/dist/interfaces/ResolverData";
import {Any, getRepository} from "typeorm";
import {Role} from "../models/Role";
import {SessionContext} from "./context";
import {Roles} from "../types";

export const authChecker = async ({ context: { account } }: ResolverData<SessionContext>, roles: Roles[] = []) => {
  if(!account) {
    return false;
  }

  const assigned = await getRepository(Role).find({
    where: { name: Any(roles), account }
  })

  return assigned.length > 0;
}
