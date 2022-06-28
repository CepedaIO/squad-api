import 'reflect-metadata';
import {appConfig} from "./configs/app";
import {buildSchema} from "type-graphql";
import {ApolloServer} from "apollo-server";
import {AccountResolver} from "./resolvers/AccountResolver";
import {createConnection} from "typeorm";
import {authChecker} from "./services/authChecker";
import context from "./services/context";

(async () => {
  await createConnection();
  const schema = await buildSchema({
    resolvers: [AccountResolver],
    authChecker
  });

  const server = new ApolloServer({
    logger: console,
    schema,
    debug: appConfig.isDev,
    context: context
  });

  // Start the server
  const { url } = await server.listen(appConfig.port);
  console.log(`Server is running, GraphQL Playground available at ${url}`);
})()
