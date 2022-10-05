import {EntityManager, In} from "typeorm";
import DataLoader from "dataloader";
import {MembershipPermissionsEntity} from "../entities/MembershipPermissionEntity";

export type MembershipPermissionsLoader = ReturnType<typeof createMembershipPermissionsEntityLoaders>;
export const createMembershipPermissionsEntityLoaders = (manager:EntityManager) => ({
  byMembershipIds: new DataLoader(async (membershipIds: number[]) =>
    manager.find(MembershipPermissionsEntity, {
      where: {
        membershipId: In(membershipIds)
      }
    })
  )
});
