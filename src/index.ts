import 'reflect-metadata';
import express from 'express';
import {appConfig} from "./configs/app";
import {buildSchema, NonEmptyArray} from "type-graphql";
import {ApolloServer} from "apollo-server-express";
import {createConnection} from "typeorm";
import {authChecker} from "./utils/authChecker";
import context, {Context} from "./utils/context";
import AuthResolver from "./resolvers/AuthResolver";
import EventQueries from "./resolvers/EventResolver/queries";
import {ResolverData} from "type-graphql/dist/interfaces/ResolverData";
import {DateTime} from "luxon";
import {DateTimeScalar} from "./utils/graphql";
import {TestResolver} from "./resolvers/TestResolver";
import cors from "cors";
import * as https from "https";
import * as fs from "fs";
import * as http from "http";
import EventMutations from "./resolvers/EventResolver/mutations";
import UserQueries from "./resolvers/UserResolver/queries";
import MembershipQueries from "./resolvers/MembershipResolver/queries";
import InviteTokenQueries from "./resolvers/InviteResolver/queries";
import JoinLinkQueries from "./resolvers/JoinLinkResolver/queries";
import JoinLinkMutations from "./resolvers/JoinLinkResolver/mutations";
import PendingMembershipQueries from "./resolvers/PendingMembershipResolver/queries";
import PendingMembershipMutations from "./resolvers/PendingMembershipResolver/mutations";
import GeneralQueries from "./resolvers/GeneralResolver/queries";

(async () => {
  console.log('Is Prod?', appConfig.isProd);
  console.log('Typeorm:', appConfig.typeorm);
  console.log('Emailer:', appConfig.emailer);
  
  await createConnection(appConfig.typeorm);
  
  let resolvers:NonEmptyArray<Function> = [
    AuthResolver, UserQueries,
    EventQueries, EventMutations,
    MembershipQueries,
    InviteTokenQueries,
    JoinLinkQueries, JoinLinkMutations,
    PendingMembershipQueries, PendingMembershipMutations,
    GeneralQueries
  ];
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
  await server.start();

  const app = express();
  app.use(cors({
    origin: '*'
  }));
  
  server.applyMiddleware({ app });
  
  const hostname = appConfig.isProd ? 'graph.cepeda.io' : 'localhost';
  if(appConfig.isProd) {
    const httpsServer = https.createServer({
      key: fs.readFileSync(`./certs/privkey.pem`, 'utf-8'),
      cert: fs.readFileSync(`./certs/fullchain.pem`, 'utf-8')
    }, app);
  
    await new Promise<void>(resolve =>
      httpsServer.listen(443, resolve)
    );
  
    console.log(`🚀 Server ready at https://${hostname}${ server.graphqlPath }`);
  }
  
  const httpServer = http.createServer(app);
  
  await new Promise<void>(resolve =>
    httpServer.listen(8100, resolve)
  );

  console.log(`🚀 Server ready at http://${hostname}${ server.graphqlPath }`);
})()
