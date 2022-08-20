import {Arg, Mutation, Resolver} from "type-graphql";
import {Event} from "../../models/Event";
import {Authenticated} from "../../decorators/Authenticated";
import {Transaction} from "../../decorators/Transaction";
import EventService from "../../services/EventService";

@Resolver()
export default class EventResolver {
  constructor(
    private eventService: EventService
  ) {}

  @Authenticated()
  @Transaction()
  @Mutation(() => Event)
  async upsert(
    @Arg("payload", () => Event) payload: Event
  ): Promise<Event> {
    return this.eventService.upsert(payload)
  }
}
