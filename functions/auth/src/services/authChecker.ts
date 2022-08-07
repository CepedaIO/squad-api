import {ResolverData} from "type-graphql/dist/interfaces/ResolverData";

import {Roles} from "../types";
import {SessionContext} from "../services/context";

export const authChecker = async ({ context }: ResolverData<SessionContext>, roles: Roles[] = []) => {
/*
  const assigned = await getRepository(Role).find({
    where: { name: Any(roles), account }
  })*/

 // return assigned.length > 0;

  return true;
}
