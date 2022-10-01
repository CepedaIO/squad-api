import {Service} from "typedi";
import {EntityManager} from "typeorm";
import {JoinTokenEntity} from "../entities/JoinTokenEntity";
import {DateTime} from "luxon";
import {InviteTokenEntity} from "../entities/InviteTokenEntity";
import {InviteSummary} from "../resolvers/EventResolver/outputs";

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
  
  async getInviteSummaries(email: string): Promise<InviteSummary[]> {
    const invites = await this.manager.createQueryBuilder(InviteTokenEntity, 'it')
      .innerJoinAndSelect('it.event', 'e')
      .innerJoinAndSelect('e.memberships', 'm', 'm.email = it.from')
      .where('it.email = :email', { email })
      .getMany();
 
    return invites.map((invite) => ({
      uuid: invite.uuid,
      key: invite.key,
      event: {
        id: invite.event.id,
        name: invite.event.name
      },
      from: invite.event.memberships[0].displayName,
      expiresOn: invite.expiresOn.toJSDate()
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
