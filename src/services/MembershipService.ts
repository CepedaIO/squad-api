import {EntityManager, In} from "typeorm";
import {MembershipEntity} from "../entities/MembershipEntity";
import {Service} from "typedi";

@Service()
export class MembershipService {
  constructor(
    private manager: EntityManager
  ) {}

  async isMemberOf(eventId: number, emails: string[]): Promise<boolean[]> {
    const members = await this.manager.find(MembershipEntity, {
      select: ['email'],
      where: {
        event: { id: eventId },
        email: In(emails)
      }
    });

    return emails.map((email) => !!members.find((member) => member.email === email));
  }
}
