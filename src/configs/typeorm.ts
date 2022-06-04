import {ConnectionOptions} from "typeorm";
import * as models from "../models";

export const connectionOptions: ConnectionOptions = {
  type: "postgres",
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER || 'superuser',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DB || 'event-matcher',
  entities: Object.values(models),
  synchronize: true
};
