import 'reflect-metadata';
import express from 'express';
import {appConfig} from "./configs/app";
import {buildSchema} from "type-graphql";
import {ApolloServer} from "apollo-server-express";
import {createConnection} from "typeorm";
import {authChecker} from "./utils/authChecker";
import context, {Context} from "./utils/context";
import {ResolverData} from "type-graphql/dist/interfaces/ResolverData";
import {DateTime} from "luxon";
import {DateTimeScalar} from "./utils/graphql";
import cors from "cors";
import * as https from "https";
import * as fs from "fs";
import * as http from "http";
import path from "path";
import {Environments, NODE_ENV} from "./configs/environments";

import "./configs/test";

(async () => {
  await createConnection(appConfig.typeorm);
  
  const schema = await buildSchema({
    resolvers: appConfig.resolvers,
    authChecker,
    scalarsMap: [
      {type: DateTime, scalar: DateTimeScalar}
    ],
    container: ({ context }: ResolverData<Context>) => context.container
  });

  const server = new ApolloServer({
    logger: console,
    schema,
    debug: NODE_ENV !== Environments.PROD,
    context: context
  });
  await server.start();

  const app = express();
  app.use(cors({
    origin: '*'
  }));
  
  server.applyMiddleware({ app });
  
  const clientPath = path.join(__dirname, '../../client', 'docs');
  console.log('Client path:', clientPath);
  app.use(express.static(path.join(clientPath)));
  app.get('/*', (req, res) => {
    res.sendFile(
      path.join(clientPath, 'index.html')
    );
  });
  
  if(NODE_ENV === Environments.PROD) {
    const httpsServer = https.createServer({
      key: fs.readFileSync(`./certs/privkey.pem`, 'utf-8'),
      cert: fs.readFileSync(`./certs/fullchain.pem`, 'utf-8')
    }, app);
  
    await new Promise<void>(resolve =>
      httpsServer.listen(443, resolve)
    );
  
    console.log(`🚀 Server ready at https://${appConfig.hostname}${ server.graphqlPath }`);
  } else {
    const httpServer = http.createServer(app);
  
    await new Promise<void>(resolve =>
      httpServer.listen(8100, resolve)
    );
    
    console.log(`🚀 Server ready at http://${appConfig.hostname}${ server.graphqlPath }`);
  }
})()
