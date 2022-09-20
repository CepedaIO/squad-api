import 'reflect-metadata';
import {appConfig} from "./configs/app";
import {buildSchema, NonEmptyArray} from "type-graphql";
import {ApolloServer} from "apollo-server";
import {createConnection} from "typeorm";
import {authChecker} from "./utils/authChecker";
import context, {Context} from "./utils/context";
import AuthResolver from "./resolvers/AuthResolver";
import EventResolver from "./resolvers/EventResolver";
import {ResolverData} from "type-graphql/dist/interfaces/ResolverData";
import {DateTime} from "luxon";
import {DateTimeScalar} from "./utils/graphql";
import {TestResolver} from "./resolvers/TestResolver";

(async () => {
  console.log('Is Prod?', appConfig.isProd);
  console.log('Typeorm:', appConfig.typeorm);
  
  await createConnection(appConfig.typeorm);
  
  let resolvers:NonEmptyArray<Function> = [AuthResolver, EventResolver];
  if(appConfig.isDev) {
    resolvers = [...resolvers, TestResolver];
  }
  
  const schema = await buildSchema({
    resolvers,
    authChecker,
    scalarsMap: [
      {type: DateTime, scalar: DateTimeScalar}
    ],
    container: ({ context }: ResolverData<Context>) => context.container
  });

  const server = new ApolloServer({
    logger: console,
    schema,
    debug: appConfig.isDev,
    context: context
  });

  // Start the server
  const { url } = await server.listen({
    host: "0.0.0.0",
    port: appConfig.port
  });
  console.log(`Server is running, GraphQL Playground available at ${url}`);
})()
