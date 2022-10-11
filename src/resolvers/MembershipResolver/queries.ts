import {Inject, Service} from "typedi";
import {FieldResolver, Resolver, Root} from "type-graphql";
import {EntityManager} from "typeorm";
import {Membership} from "../../entities/Membership";
import {MembershipPermissionsLoader} from "../../dataloaders/MembershipPermissionsEntity";
import {AvailabilityLoader} from "../../dataloaders/AvailabilityEntity";
import {MembershipPermission} from "../../entities/MembershipPermission";
import {MemberAvailability} from "../../entities/MemberAvailability";
import {tokens} from "../../utils/container";

@Service()
@Resolver(() => Membership)
export default class MembershipQueries {
  constructor(
    private manager: EntityManager,
    @Inject(tokens.MembershipPermissionLoader) private permissionLoader: MembershipPermissionsLoader,
    @Inject(tokens.AvailabilityLoader) private availabilityLoader: AvailabilityLoader
  ) {}
  
  @FieldResolver(() => MembershipPermission)
  permissions(
    @Root() membership: Membership
  ) {
    return this.permissionLoader.byMembershipIds.load(membership.id);
  }
  
  @FieldResolver(() => [MemberAvailability])
  availabilities(
    @Root() membership: Membership
  ) {
    return this.availabilityLoader.byMembershipIds.load(membership.id);
  }
  
}
