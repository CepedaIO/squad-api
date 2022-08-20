import {createMethodDecorator, NextFn, ResolverData} from "type-graphql";
import {getManager} from "typeorm";
import {Context} from "../utils/context";
import {tokens} from "../tokens";

export const Transaction = () => {
  return createMethodDecorator(({ context }: ResolverData<Context>, next: NextFn) => {
    return getManager().transaction(async (manager) => {
      context.container.set(tokens.EntityManager, manager);
      return next();
    });
  });
};
