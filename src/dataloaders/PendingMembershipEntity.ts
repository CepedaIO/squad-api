import {EntityManager, In} from "typeorm";
import DataLoader from "dataloader";
import {PendingMembershipEntity} from "../entities/PendingMembershipEntity";

export type PendingMembershipLoader = ReturnType<typeof createPendingMembershipEntityLoaders>;
export const createPendingMembershipEntityLoaders = (manager:EntityManager) => ({
  byIds: new DataLoader(async (ids: number[]) =>
    manager.findByIds(PendingMembershipEntity, ids)
  ),
  byEmails: new DataLoader(async (emails: string[]) => {
    const memberships = await manager.find(PendingMembershipEntity, {
      where: { email: In(emails) }
    });
    
    return emails.map((email) =>
      memberships.filter((membership) => membership.email === email)
    );
  }),
  byEventIds: new DataLoader(async (eventIds: number[]) => {
    const memberships = await manager.find(PendingMembershipEntity, {
      where: { eventId: In(eventIds) }
    });
    
    return eventIds.map((eventId) =>
      memberships.filter((membership) => membership.eventId === eventId)
    );
  })
})
