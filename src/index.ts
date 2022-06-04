import 'reflect-metadata';
import { publish } from '@vlegm/expressman';
import {createConnection, EntityManager, Repository} from "typeorm";
import {connectionOptions} from "./configs/typeorm";
import {tokens} from "./tokens";
import {User} from "./models";
import {appConfig} from "./configs/app";
const express = require("express");

console.log('Connecting to postgres with:', connectionOptions);
createConnection(connectionOptions).then((connection) =>
  publish(express(), {
    pattern:'src/routes/**.ts',
    swagger: {
      path: '/swagger',
      define: {
        title: 'Event Matcher App',
        description: 'This is an app for matching events (usually games)'
      },
    },
    configureContainer(container, request, response): any {
      const manager = connection.createEntityManager();
      container.register<EntityManager>(EntityManager, { useValue: manager });
      container.register<Repository<User>>(tokens.UserRepository, { useValue: manager.getRepository(User) });
    },
    onUncaughtException(container, error) {
      console.log(error);
    }
  })
).then(({ app }) =>
  app.listen(appConfig.port, () => console.log(`Started: http://localhost:${appConfig.port}/swagger`))
);
