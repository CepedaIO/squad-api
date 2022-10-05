import {EventEntity} from "../entities/EventEntity";
import {Inject, Service} from "typedi";
import {EntityManager} from "typeorm";
import {EventLoader} from "../dataloaders/EventEntity";
import {tokens} from "../tokens";

@Service()
export default class EventService {
  constructor(
    private manager: EntityManager,
    @Inject(tokens.EventLoader) private eventLoader: EventLoader
  ) {}
  
  async isMember(eventId: number, email: string): Promise<boolean> {
    return this.eventLoader.areMembers.load([eventId, email]);
  }
}
