import {Database} from "../utils/typeorm";
import {Event} from "../models/Event";
import {Service} from "typedi";

@Service()
export default class EventService {
  constructor(
    private db: Database
  ) {}

  async upsert(event: Event) {
    return this.db.upsert(Event, event);
  }
}
