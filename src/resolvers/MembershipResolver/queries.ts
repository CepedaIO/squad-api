import {Inject, Service} from "typedi";
import {FieldResolver, Resolver, Root} from "type-graphql";
import {EntityManager} from "typeorm";
import {tokens} from "../../tokens";
import {MembershipEntity} from "../../entities/MembershipEntity";
import {MembershipPermissionsLoader} from "../../dataloaders/MembershipPermissionsEntity";
import {AvailabilityLoader} from "../../dataloaders/AvailabilityEntity";
import {MembershipPermissionsEntity} from "../../entities/MembershipPermissionEntity";
import {AvailabilityEntity} from "../../entities/AvailabilityEntity";

@Service()
@Resolver(() => MembershipEntity)
export default class MembershipQueries {
  constructor(
    private manager: EntityManager,
    @Inject(tokens.MembershipPermissionLoader) private permissionLoader: MembershipPermissionsLoader,
    @Inject(tokens.AvailabilityLoader) private availabilityLoader: AvailabilityLoader
  ) {}
  
  @FieldResolver(() => MembershipPermissionsEntity)
  permissions(
    @Root() membership: MembershipEntity
  ) {
    return this.permissionLoader.byMembershipIds.load(membership.id);
  }
  
  @FieldResolver(() => [AvailabilityEntity])
  availabilities(
    @Root() membership: MembershipEntity
  ) {
    return this.availabilityLoader.byMembershipIds.load(membership.id);
  }
  
}
