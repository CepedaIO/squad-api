import 'reflect-metadata';
import {appConfig} from "./configs/app";
import {buildSchemaSync} from "type-graphql";
import {ApolloServer} from "apollo-server-cloud-functions";
import {authChecker} from "./services/authChecker";
import {context} from "./services/context";
import {AuthResolver} from "./resolver";

const server = new ApolloServer({
  logger: console,
  csrfPrevention: true,
  schema: buildSchemaSync({
    resolvers: [AuthResolver],
    authChecker
  }),
  debug: appConfig.isDev,
  context: context
});

exports.moocow = server.createHandler();
