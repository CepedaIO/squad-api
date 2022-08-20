import {Token} from "typedi";
import {EntityManager} from "typeorm";

export const tokens = {
  EntityManager: new Token<EntityManager>(),
  requestId: new Token<string>()
}
