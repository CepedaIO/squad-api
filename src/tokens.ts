import {Token} from "typedi";
import {EntityManager} from "typeorm";
import {EventLoader} from "./dataloaders/EventEntity";
import {InviteTokenLoader} from "./dataloaders/InviteTokenEntity";
import {MembershipPermissionsLoader} from "./dataloaders/MembershipPermissionsEntity";
import {AvailabilityLoader} from "./dataloaders/AvailabilityEntity";
import {MembershipLoader} from "./dataloaders/MembershipEntity";

export const tokens = {
  EntityManager: new Token<EntityManager>(),
  RequestId: new Token<string>(),
  EventLoader: new Token<EventLoader>(),
  InviteTokenLoader: new Token<InviteTokenLoader>(),
  MembershipPermissionLoader: new Token<MembershipPermissionsLoader>(),
  AvailabilityLoader: new Token<AvailabilityLoader>(),
  MembershipLoader: new Token<MembershipLoader>()
}
