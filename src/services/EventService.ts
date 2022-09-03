import {Database} from "../utils/typeorm";
import {EventEntity} from "../entities/EventEntity";
import {Service} from "typedi";

@Service()
export default class EventService {
  constructor(
    private db: Database
  ) {}

  async upsert(event: EventEntity) {
    return this.db.upsert(EventEntity, event);
  }
}
