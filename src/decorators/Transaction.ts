import {createMethodDecorator, NextFn, ResolverData} from "type-graphql";
import {EntityManager, getManager} from "typeorm";
import {Context} from "../utils/context";

export const Transaction = () => {
  return createMethodDecorator(({ context }: ResolverData<Context>, next: NextFn) => {
    return getManager().transaction(async (manager) => {
      context.container.set(EntityManager, manager);
      return next();
    });
  });
};
