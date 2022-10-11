import {Inject, Service} from "typedi";
import {Arg, Ctx, Mutation, Resolver} from "type-graphql";
import {EntityManager} from "typeorm";
import {EventLoader} from "../../dataloaders/EventEntity";
import {JoinLink} from "../../entities/JoinLink";
import {JoinLinkLoader} from "../../dataloaders/TokenEntity";
import {SimpleResponse} from "../SimpleResponse";
import {RequestJoinInput} from "./inputs";
import {UserInputError} from "apollo-server";
import {PendingMembership} from "../../entities/PendingMembership";
import {AuthenticatedContext} from "../../utils/context";
import {Authenticated} from "../../decorators/Authenticated";
import {tokens} from "../../utils/container";

@Service()
@Resolver(() => JoinLink)
export default class JoinLinkMutations {
  constructor(
    private manager: EntityManager,
    @Inject(tokens.EventLoader) private eventLoader: EventLoader,
    @Inject(tokens.JoinLinkLoader) private joinLinkLoader: JoinLinkLoader
  ) {}
  
  @Authenticated()
  @Mutation(() => SimpleResponse)
  async createJoinRequest(
    @Arg('payload') payload: RequestJoinInput,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<SimpleResponse> {
    const { key, eventId, displayName, availabilities } = payload;
    const joinLinks = await this.joinLinkLoader.byKeys.load(key);
    const joinLink = joinLinks.find((joinLink) => joinLink.eventId === eventId);
    
    if(!joinLink) {
      throw new UserInputError('Invalid key for event');
    }
    
    const pending = await this.manager.findOne(PendingMembership, {
      where: { eventId: payload.eventId, email: ctx.email }
    })
    
    if(pending) {
      throw new UserInputError('Already a pending membership');
    }

    await this.manager.save(PendingMembership, {
      email: ctx.email,
      displayName,
      availabilities,
      eventId
    });
    
    return {
      success: true,
      result: 'Join request created'
    };
  }
}
