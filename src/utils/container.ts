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
import {createTransport, Transporter} from "nodemailer";
import {env} from "node:process";
import {appConfig} from "../configs/app";

export const tokens = {
  Transporter: new Token<Transporter>('Transporter'),
  EntityManager: new Token<EntityManager>('EntityManager'),
  RequestId: new Token<string>('RequestId'),
  EventLoader: new Token<EventLoader>('EventLoader'),
  InviteTokenLoader: new Token<InviteTokenLoader>('InviteTokenLoader'),
  JoinLinkLoader: new Token<JoinLinkLoader>('JoinLinkLoader'),
  MembershipPermissionLoader: new Token<MembershipPermissionsLoader>('MembershipPermissionLoader'),
  AvailabilityLoader: new Token<AvailabilityLoader>('AvailabilityLoader'),
  MembershipLoader: new Token<MembershipLoader>('MembershipLoader'),
  PendingMembershipLoader: new Token<PendingMembershipLoader>('PendingMembershipLoader')
}

export const createContainer = (id: string, manager: EntityManager) => {
  const container = Container.of(id);
  
  container.set(EntityManager, manager);
  container.set(tokens.EventLoader, createEventEntityLoaders(manager));
  container.set(tokens.InviteTokenLoader, createInviteTokenEntityLoaders(manager));
  container.set(tokens.JoinLinkLoader, createJoinLinkEntityLoaders(manager));
  container.set(tokens.MembershipPermissionLoader, createMembershipPermissionsEntityLoaders(manager));
  container.set(tokens.AvailabilityLoader, createAvailabilityEntityLoaders(manager));
  container.set(tokens.MembershipLoader, createMembershipEntityLoaders(manager));
  container.set(tokens.PendingMembershipLoader, createPendingMembershipEntityLoaders(manager));
  container.set(tokens.Transporter, appConfig.transporter);

  return container;
}
