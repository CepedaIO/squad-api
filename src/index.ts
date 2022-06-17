import 'reflect-metadata';
import {appConfig} from "./configs/app";
import {buildSchema} from "type-graphql";
import {ApolloServer} from "apollo-server";
import {AccountResolver} from "./resolvers/AccountResolver";
import {Any, createConnection, getRepository} from "typeorm";
import jwt from "jsonwebtoken";
import {AccountModel} from "./models/AccountModel";
import {ResolverData} from "type-graphql/dist/interfaces/ResolverData";
import {RoleModel} from "./models/RoleModel";
import {AppContext, Roles} from "./types";

(async () => {
  await createConnection();
  const schema = await buildSchema({
    resolvers: [AccountResolver],
    authChecker: async ({ context: { account } }: ResolverData<AppContext>, roles: Roles[] = []) => {
      if(!account) {
        return false;
      }

      const assigned = await getRepository(RoleModel).find({
        where: { name: Any(roles), account }
      })

      return assigned.length > 0;
    }
  });

  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const auth = req.headers.authorization || '';
      const ctx:AppContext = { };

      if(auth) {
        const { email, token } = jwt.verify(auth, appConfig.jwtSecret);
        const account = await getRepository(AccountModel).findOneOrFail({
          where: { email }
        });

        if(!jwt.verify(token, account.secret)) {
          throw new Error('Invalid JWT');
        }

        ctx.account = account;
      }

      return ctx;
    }
  });

  // Start the server
  const { url } = await server.listen(appConfig.port);
  console.log(`Server is running, GraphQL Playground available at ${url}`);
})()
