import 'reflect-metadata';
import {appConfig} from "./configs/app";
import {buildSchema} from "type-graphql";
import {ApolloServer} from "apollo-server";
import {AccountResolver} from "./resolvers/AccountResolver";
import {createConnection, getRepository} from "typeorm";
import {AppContext} from "./types";
import {Session} from "./models/Session";
import {authChecker} from "./services/AuthChecker";
import {decompress} from "./services/jwt";

(async () => {
  await createConnection();
  const schema = await buildSchema({
    resolvers: [AccountResolver],
    authChecker
  });

  const server = new ApolloServer({
    schema,
    debug: appConfig.isDev,
    context: async ({ req }) => {
      const auth = req.headers.authorization || '';
      const ctx:AppContext = { };

      if(auth) {
        const { account, session } = await decompress(auth);

        /**
         * Replace by memcache or other in-memory lookup
         */
        await getRepository(Session).findOneOrFail({
          where: session
        });

        ctx.account = account;
      }

      return ctx;
    }
  });

  // Start the server
  const { url } = await server.listen(appConfig.port);
  console.log(`Server is running, GraphQL Playground available at ${url}`);
})()
