import 'reflect-metadata';
import {appConfig} from "./configs/app";
import {buildSchema} from "type-graphql";
import {ApolloServer} from "apollo-server";
import {UserResolver} from "./resolvers/User";
import {createConnection} from "typeorm";
import {User} from "./models/User";

(async () => {
  await createConnection({
    type: 'postgres',
    entities: [User],
    synchronize: true
  });
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
