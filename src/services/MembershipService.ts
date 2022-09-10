import {EntityManager, In} from "typeorm";
import {MembershipEntity} from "../entities/MembershipEntity";
import {Service} from "typedi";

@Service()
export class MembershipService {
  constructor(
    private manager: EntityManager
  ) {}
  
  async membershipsFor(eventId: number, emails: string[]): Promise<Array<MembershipEntity | undefined>> {
    const members = await this.manager.find(MembershipEntity, {
      where: {
        event: { id: eventId },
        email: In(emails)
      }
    });

    return emails.map((email) => members.find((member) => member.email === email));
  }
}
