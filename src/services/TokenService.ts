import {Service} from "typedi";
import {EntityManager} from "typeorm";
import {JoinLinkEntity} from "../entities/JoinTokenEntity";
import {createKey} from "../utils/bag";
import {EventEntity} from "../entities/EventEntity";

@Service()
export class TokenService {
  constructor(
    private manager: EntityManager
  ) {}
  
 async createJoinLink(event: EventEntity, message: string) {
    return this.manager.save(JoinLinkEntity, this.manager.create(JoinLinkEntity, {
      key: createKey(),
      event,
      message
    }));
  }
}
