import {EntityManager, In} from "typeorm";
import DataLoader from "dataloader";
import {InviteTokenEntity} from "../entities/InviteTokenEntity";
import {JoinLinkEntity} from "../entities/JoinTokenEntity";

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

export type JoinLinkLoader = ReturnType<typeof createJoinLinkEntityLoaders>;
export const createJoinLinkEntityLoaders = (manager:EntityManager) => ({
  byEventId: new DataLoader(async (eventIds: number[]) => {
    const invites = await manager.find(JoinLinkEntity, {
      where: { eventId: In(eventIds) }
    });
    
    return eventIds.map((eventId) =>
      invites.find((invite) => invite.eventId === eventId)
    );
  })
});
