import {Token} from "typedi";
import {EntityManager} from "typeorm";
import {EventLoader} from "./dataloaders/EventEntity";
import {InviteTokenLoader, JoinLinkLoader} from "./dataloaders/TokenEntity";
import {MembershipPermissionsLoader} from "./dataloaders/MembershipPermissionsEntity";
import {AvailabilityLoader} from "./dataloaders/AvailabilityEntity";
import {MembershipLoader} from "./dataloaders/MembershipEntity";
import {PendingMembershipLoader} from "./dataloaders/PendingMembershipEntity";

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
