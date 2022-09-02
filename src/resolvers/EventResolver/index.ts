import {Arg, Ctx, Mutation, Resolver} from "type-graphql";
import {EventModel} from "../../models/EventModel";
import {Authenticated} from "../../decorators/Authenticated";
import {Transaction} from "../../decorators/Transaction";
import {Service} from "typedi";
import {Database} from "../../utils/typeorm";
import {MembershipModel} from "../../models/MembershipModel";
import {AvailabilityModel} from "../../models/AvailabilityModel";
import {AuthenticatedContext} from "../../utils/context";
import CreateEventInput from "./CreateEventInput";

@Service()
@Resolver()
export default class EventResolver {
  constructor(
    private db: Database,
  ) {}

  @Authenticated()
  @Transaction()
  @Mutation(() => EventModel, {
    description: 'Create an event'
  })
  async createEvent(
    @Arg("payload", () => CreateEventInput) payload: CreateEventInput,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<EventModel> {
    const event = this.db.create(EventModel, {
      ...payload,
      memberships: [
        this.db.create(MembershipModel, {
          displayName: payload.displayName,
          email: ctx.email,
          availabilities: payload.availabilities.map((form) =>
            this.db.create(AvailabilityModel, form)
          )
        })
      ]
    });

    return await this.db.save(EventModel, event);
  }
}
