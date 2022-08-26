import {appConfig} from "../configs/app";
import {NextFn} from "type-graphql/dist/interfaces/Middleware";
import {ResolverData} from "type-graphql/dist/interfaces/ResolverData";
import {createMethodDecorator} from "type-graphql";
import {Context} from "../utils/context";

export const DevOnly = () => {
  return createMethodDecorator(({ context }: ResolverData<Context>, next: NextFn) => {
    if(!appConfig.isDev) {
      throw new Error('Fuck off');
    } else {
      return next();
    }
  });
}
