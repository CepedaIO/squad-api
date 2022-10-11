import {Service} from "typedi";
import {Arg, Mutation, Resolver} from "type-graphql";
import {SimpleResponse} from "./SimpleResponse";
import {EntityManager, In} from "typeorm";
import {appConfig} from "../configs/app";
import {Membership} from "../entities/Membership";
import {Event} from "../entities/Event";
import SessionService from "../services/SessionService";
import {AuthenticationError} from "apollo-server";
import {Session} from "../entities/Session";

@Service()
@Resolver()
export class TestResolver {
  constructor(
    private manager: EntityManager,
    private sessionService: SessionService
  ) {}

  @Mutation(() => SimpleResponse, {
    description: 'Delete all data created by test users'
  })
  async deleteTestData(): Promise<SimpleResponse> {
    const eventResult = await this.manager.createQueryBuilder(Event, 'e')
      .delete()
      .where(() => `id IN (${
        this.manager.createQueryBuilder(Membership, 'm')
          .select('event_id')
          .where(`m.email IN (:...emails)`)
          .getQuery()
        })`
      )
      .setParameters({
        emails: appConfig.testUsers
      })
      .execute();
    
    const sessionResult = await this.manager.delete(Session, {
      email: In(appConfig.testUsers)
    });
    
    return {
      success: true,
      result: `Deleted ${eventResult.affected} events and ${sessionResult.affected} sessions`
    };
  }
  
  @Mutation(() => SimpleResponse, {
    description: 'Login a test user'
  })
  async loginTestUser(
    @Arg('email') email: string
  ): Promise<SimpleResponse> {
    if(!appConfig.testUsers.includes(email)) {
      throw new AuthenticationError('Can only log in test users this way');
    }
    
    const session = await this.sessionService.createShortSession(email, true);
    return {
      success: true,
      result: await  this.sessionService.toJWT(session)
    };
  }
}
