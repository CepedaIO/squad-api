import {EntityManager, In} from "typeorm";
import DataLoader from "dataloader";
import {MembershipEntity} from "../entities/MembershipEntity";

export type MembershipLoader = ReturnType<typeof createMembershipEntityLoaders>;
export const createMembershipEntityLoaders = (manager:EntityManager) => ({
  membersByEventIds: new DataLoader(async (eventIds: number[]) => {
    const memberships = await manager.find(MembershipEntity, {
      where: {eventId: In(eventIds)}
    });
    
    return eventIds.map((eventId) =>
      memberships.filter(membership => membership.eventId === eventId)
    );
  }),
  adminsByEventIds: new DataLoader(async (eventIds: number[]) => {
    const memberships = await manager.find(MembershipEntity, {
      where: {
        eventId: In(eventIds),
        permissions: { isAdmin: true }
      }
    });
    
    return eventIds.map((eventId) =>
      memberships.filter(membership => membership.eventId === eventId)
    );
  })
});
