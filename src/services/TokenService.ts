import {Service} from "typedi";
import {EntityManager} from "typeorm";
import {JoinTokenEntity} from "../entities/JoinTokenEntity";
import {DateTime} from "luxon";
import {InviteTokenEntity} from "../entities/InviteTokenEntity";

type EventToken = JoinTokenEntity | InviteTokenEntity;

@Service()
export class TokenService {
  constructor(
    private manager: EntityManager
  ) {}
  
  createJoinToken(eventId: number, from: string, message: string) {
    return this.manager.save(JoinTokenEntity, this.manager.create(JoinTokenEntity, {
      message,
      from,
      event: { id: eventId },
      expiresOn: DateTime.now().endOf('day').plus({ days: 3 })
    }));
  }
  
  async consumeToken(uuid: string, key: string): Promise<boolean> {
    const inviteToken = await this.manager.findOne(InviteTokenEntity, { uuid, key });
    const joinToken = await this.manager.findOne(JoinTokenEntity, { uuid, key });
    
    if(inviteToken) {
      await this.manager.delete(InviteTokenEntity, inviteToken);
    } else if(joinToken) {
      await this.manager.delete(JoinTokenEntity, joinToken);
    } else {
      return false;
    }
    
    return true;
  }
}
