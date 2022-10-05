import {EntityManager, In} from "typeorm";
import DataLoader from "dataloader";
import {InviteTokenEntity} from "../entities/InviteTokenEntity";

export type InviteTokenLoader = ReturnType<typeof createInviteTokenEntityLoaders>;
export const createInviteTokenEntityLoaders = (manager:EntityManager) => ({
  byEmails: new DataLoader(async (emails: string[]) => {
    const invites = await manager.find(InviteTokenEntity, {
      where: {email: In(emails)}
    });
    
    return emails.map((email) =>
      invites.filter((invite) => invite.email === email)
    );
  })
});
