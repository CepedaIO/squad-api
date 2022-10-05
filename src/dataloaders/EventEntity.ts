import DataLoader from "dataloader";
import {EntityManager, In} from "typeorm";
import {EventEntity} from "../entities/EventEntity";
import {MembershipEntity} from "../entities/MembershipEntity";

export type EventLoader = ReturnType<typeof createEventEntityLoaders>;
export const createEventEntityLoaders = (manager: EntityManager) => {
  const dataloaders = {
    areAdmins: new DataLoader(async (idEmails: [number, string][]) =>
      idEmails.map(([eventId, email]) =>
        manager.find(MembershipEntity, {
          where: {
            eventId, email,
            permissions: { isAdmin: true }
          }
        })
      ).map((membership) => !!membership)
    ),
    areMembers: new DataLoader(async (idEmails: [number, string][]) =>
      idEmails.map(([eventId, email]) =>
        manager.find(MembershipEntity, {
          where: { eventId, email }
        })
      ).map((membership) => !!membership)
    ),
    byIds: new DataLoader(async (ids: number[]) => {
      const events = manager.find(EventEntity, {
        loadEagerRelations: true,
        relations: ['memberships', 'memberships.permissions', 'memberships.availabilities'],
        where: {
          id: In(ids)
        }
      })
      
      return events;
    }),
    byEmails: new DataLoader(async (emails: string[]): Promise<EventEntity[][]> => {
      const memberships = await manager.find(MembershipEntity, {
        where: {
          email: In(emails)
        }
      });
      
      const eventIds = memberships.map((membership) => membership.eventId);
      
      const eventOrErrors = await dataloaders.byIds.loadMany(eventIds);
      const errors = eventOrErrors.filter((eventOrError) => eventOrError instanceof Error);
      const events = eventOrErrors.filter((eventOrError) => eventOrError instanceof EventEntity) as EventEntity[];
      
      if(errors.length) {
        console.log('----Errors fetching events by emails----');
        errors.forEach((error) => console.log(error));
      }
      
      return emails.map((email) =>
        memberships.filter((membership) => membership.email === email)
          .map((membership) => events.find((event) => event.id === membership.eventId))
      );
    })
  };
  
  return dataloaders;
}
