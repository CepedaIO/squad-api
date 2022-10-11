import {EntityManager, In} from "typeorm";
import {Membership} from "../entities/Membership";
import {Service} from "typedi";

@Service()
export class MembershipService {
  constructor(
    private manager: EntityManager
  ) {}
  
  async eventIdsFor(emails: string[]): Promise<number[]> {
    const memberships = await this.manager.find(Membership, {
      select: ['eventId'],
      where: { email: In(emails) }
    });

    return memberships.map((membership) => membership.eventId);
  }
  
  async membershipsFor(eventId: number, emails: string[]): Promise<Array<Membership | undefined>> {
    const members = await this.manager.find(Membership, {
      where: {
        event: { id: eventId },
        email: In(emails)
      }
    });

    return emails.map((email) => members.find((member) => member.email === email));
  }
  
  async isAdmin(eventId: number, email: string) : Promise<boolean> {
    const membership = await this.manager.createQueryBuilder(Membership, 'm')
      .innerJoinAndSelect('m.permissions', 'p')
      .where('m.eventId = :eventId', { eventId })
      .andWhere('m.email = :email', { email })
      .andWhere('p.is_admin = true')
      .getOne();
    
    return !!membership;
  }
}
