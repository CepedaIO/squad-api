import {appConfig} from "../configs/app";
import {Middleware, NextFn} from "type-graphql/dist/interfaces/Middleware";
import {ResolverData} from "type-graphql/dist/interfaces/ResolverData";

export const DevOnly:Middleware = (action: ResolverData, next: NextFn) => {
  if(!appConfig.isDev) {
    throw new Error('Fuck off');
  } else {
    return next();
  }
}
