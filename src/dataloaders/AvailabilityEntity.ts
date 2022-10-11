import {EntityManager, In} from "typeorm";
import DataLoader from "dataloader";
import {MemberAvailability} from "../entities/MemberAvailability";

export type AvailabilityLoader = ReturnType<typeof createAvailabilityEntityLoaders>;
export const createAvailabilityEntityLoaders = (manager:EntityManager) => ({
  byMembershipIds: new DataLoader(async (membershipIds: number[]) => {
    const availabilities = await manager.find(MemberAvailability, {
      where: {
        membershipId: In(membershipIds)
      }
    });
    
    return membershipIds.map((membershipId) =>
      availabilities.filter((availability) => availability.membershipId === membershipId)
    );
  })
});
