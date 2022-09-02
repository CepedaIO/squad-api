import {Database} from "../utils/typeorm";
import {EventModel} from "../models/EventModel";
import {Service} from "typedi";

@Service()
export default class EventService {
  constructor(
    private db: Database
  ) {}

  async upsert(event: EventModel) {
    return this.db.upsert(EventModel, event);
  }
}
