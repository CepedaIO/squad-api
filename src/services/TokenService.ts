import {Service} from "typedi";
import {EntityManager} from "typeorm";
import {JoinLink} from "../entities/JoinLink";
import {createKey} from "../utils/bag";
import {Event} from "../entities/Event";

@Service()
export class TokenService {
  constructor(
    private manager: EntityManager
  ) {}
  
 async createJoinLink(event: Event, message: string) {
    return this.manager.save(JoinLink, this.manager.create(JoinLink, {
      key: createKey(),
      event,
      message
    }));
  }
}
