import 'reflect-metadata';
import {appConfig} from "./configs/app";
import {buildSchema} from "type-graphql";
import {ApolloServer} from "apollo-server";
import {UserResolver} from "./resolvers/User";
import {createConnection} from "typeorm";

(async () => {
  await createConnection();
  const schema = await buildSchema({
    resolvers: [UserResolver]
  });

  const server = new ApolloServer({
    schema
  });

  // Start the server
  const { url } = await server.listen(appConfig.port);
  console.log(`Server is running, GraphQL Playground available at ${url}`);
})()
