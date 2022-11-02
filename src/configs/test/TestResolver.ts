import {Service} from "typedi";
import {Arg, Mutation, Resolver} from "type-graphql";
import {SimpleResponse} from "../../resolvers/SimpleResponse";
import {EntityManager, In} from "typeorm";
import {appConfig} from "../app";
import {Membership} from "../../entities/Membership";
import {Event} from "../../entities/Event";
import SessionService from "../../services/SessionService";
import {AuthenticationError} from "apollo-server";
import {Session} from "../../entities/Session";
import {TestSession} from "./index";

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
    const testSessions = await this.manager.find(TestSession, {
      relations: ['session']
    });
    
    if(testSessions.length === 0) {
      return {
        success: true,
        result: `Deleted 0 events and 0 sessions`
      }
    }
    
    const emails = testSessions.map((test) => test.session.email);
    
    const eventResult = await this.manager.createQueryBuilder(Event, 'e')
      .delete()
      .where(() => `id IN (${
        this.manager.createQueryBuilder(Membership, 'm')
          .select('event_id')
          .where(`m.email IN (:...emails)`)
          .getQuery()
        })`
      )
      .setParameters({ emails })
      .execute();
    
    const sessionResult = await this.manager.delete(Session, {
      email: In(emails)
    });
    
    const ids = testSessions.map((test) => test.id);
    await this.manager.delete(TestSession, {
      id: In(ids)
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
    const session = await this.sessionService.createShortSession(email, true);
    await this.manager.insert(TestSession, { session });
    
    return {
      success: true,
      result: await this.sessionService.toJWT(session)
    };
  }
}
