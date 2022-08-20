import {createMethodDecorator, NextFn, ResolverData} from "type-graphql";
import {Context, isAuthenticatedContext} from "../utils/context";

export const Authenticated = (roles?: string[]) => {
  return createMethodDecorator(({ context }: ResolverData<Context>, next: NextFn) => {
    if(!isAuthenticatedContext(context)) {
      throw new Error('Must be authenticated');
    }

    return next();
  });
}
