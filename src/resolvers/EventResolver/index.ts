import {Arg, Ctx, Mutation, Resolver} from "type-graphql";
import {Event} from "../../models/Event";
import {Authenticated} from "../../decorators/Authenticated";
import {Transaction} from "../../decorators/Transaction";
import {Service} from "typedi";
import {Database} from "../../utils/typeorm";
import CreateEventInput from "./CreateEventInput";
import {Membership} from "../../models/Membership";
import {Availability} from "../../models/Availability";
import {AuthenticatedContext} from "../../utils/context";

@Service()
@Resolver()
export default class EventResolver {
  constructor(
    private db: Database,
  ) {}

  @Authenticated()
  @Transaction()
  @Mutation(() => Event, {
    description: 'Create an event'
  })
  async createEvent(
    @Arg("payload", () => CreateEventInput) payload: CreateEventInput,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<Event> {
    const event = this.db.create(Event, {
      ...payload,
      memberships: [
        this.db.create(Membership, {
          displayName: payload.displayName,
          email: ctx.email,
          availability: payload.availability.map((form) =>
            this.db.create(Availability, form)
          )
        })
      ]
    });

    const result = await this.db.save(Event, event);

    debugger;
    return result;
  }
}
