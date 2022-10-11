import {Container, Token} from "typedi";
import {EntityManager} from "typeorm";
import {createEventEntityLoaders, EventLoader} from "../dataloaders/EventEntity";
import {
  createInviteTokenEntityLoaders,
  createJoinLinkEntityLoaders,
  InviteTokenLoader,
  JoinLinkLoader
} from "../dataloaders/TokenEntity";
import {
  createMembershipPermissionsEntityLoaders,
  MembershipPermissionsLoader
} from "../dataloaders/MembershipPermissionsEntity";
import {AvailabilityLoader, createAvailabilityEntityLoaders} from "../dataloaders/AvailabilityEntity";
import {createMembershipEntityLoaders, MembershipLoader} from "../dataloaders/MembershipEntity";
import {createPendingMembershipEntityLoaders, PendingMembershipLoader} from "../dataloaders/PendingMembershipEntity";

export const tokens = {
  EntityManager: new Token<EntityManager>(),
  RequestId: new Token<string>(),
  EventLoader: new Token<EventLoader>(),
  InviteTokenLoader: new Token<InviteTokenLoader>(),
  JoinLinkLoader: new Token<JoinLinkLoader>(),
  MembershipPermissionLoader: new Token<MembershipPermissionsLoader>(),
  AvailabilityLoader: new Token<AvailabilityLoader>(),
  MembershipLoader: new Token<MembershipLoader>(),
  PendingMembershipLoader: new Token<PendingMembershipLoader>()
}

export const createContainer = (id: string, manager: EntityManager) => {
  const container =  Container.of(id);
  
  container.set(EntityManager, manager);
  container.set(tokens.EventLoader, createEventEntityLoaders(manager));
  container.set(tokens.InviteTokenLoader, createInviteTokenEntityLoaders(manager));
  container.set(tokens.JoinLinkLoader, createJoinLinkEntityLoaders(manager));
  container.set(tokens.MembershipPermissionLoader, createMembershipPermissionsEntityLoaders(manager));
  container.set(tokens.AvailabilityLoader, createAvailabilityEntityLoaders(manager));
  container.set(tokens.MembershipLoader, createMembershipEntityLoaders(manager));
  container.set(tokens.PendingMembershipLoader, createPendingMembershipEntityLoaders(manager));
  
  return container;
}
