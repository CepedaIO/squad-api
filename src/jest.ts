import {createContainer} from "./utils/container";
import {EntityManager} from "typeorm";

export const createTestContainer = () => {
  const container = createContainer('test', {} as EntityManager);
  return container;
}
