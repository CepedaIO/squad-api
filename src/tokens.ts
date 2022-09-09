import {Token} from "typedi";
import {EntityManager} from "typeorm";

export const tokens = {
  EntityManager: new Token<EntityManager>(),
  RequestId: new Token<string>()
}
