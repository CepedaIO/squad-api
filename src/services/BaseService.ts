import {inject} from "@vlegm/expressman";
import {EntityManager} from "typeorm";

export abstract class BaseService {
  constructor(
    @inject(EntityManager)
    protected manager: EntityManager
  ) {}
}
