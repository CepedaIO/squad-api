import {EntityManager, In} from "typeorm";
import DataLoader from "dataloader";
import {MembershipPermission} from "../entities/MembershipPermission";

export type MembershipPermissionsLoader = ReturnType<typeof createMembershipPermissionsEntityLoaders>;
export const createMembershipPermissionsEntityLoaders = (manager:EntityManager) => ({
  byMembershipIds: new DataLoader(async (membershipIds: number[]) => {
    const permissions = await manager.find(MembershipPermission, {
      where: {
        membershipId: In(membershipIds)
      }
    });
    
    return membershipIds.map((membershipId) => permissions.find((permission) => permission.membershipId === membershipId));
  })
});
