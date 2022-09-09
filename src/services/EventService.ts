import {EventEntity} from "../entities/EventEntity";
import {Service} from "typedi";
import {EntityManager} from "typeorm";

@Service()
export default class EventService {
  constructor(
    private manager: EntityManager
  ) {}

  async upsert(event: EventEntity) {
    return this.manager.save(EventEntity, event);
  }
}
