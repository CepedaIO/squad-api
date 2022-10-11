import {EntityManager, In} from "typeorm";
import DataLoader from "dataloader";
import {MembershipPermission} from "../entities/MembershipPermission";

export type MembershipPermissionsLoader = ReturnType<typeof createMembershipPermissionsEntityLoaders>;
export const createMembershipPermissionsEntityLoaders = (manager:EntityManager) => ({
  byMembershipIds: new DataLoader(async (membershipIds: number[]) =>
    manager.find(MembershipPermission, {
      where: {
        membershipId: In(membershipIds)
      }
    })
  )
});
