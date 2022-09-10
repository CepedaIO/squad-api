import {Service} from "typedi";
import {Arg, Mutation, Resolver} from "type-graphql";
import {SimpleResponse} from "./SimpleResponse";
import {EntityManager} from "typeorm";
import {appConfig} from "../configs/app";
import {MembershipEntity} from "../entities/MembershipEntity";
import {EventEntity} from "../entities/EventEntity";
import SessionService from "../services/SessionService";
import {AuthenticationError} from "apollo-server";

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
    const result = await this.manager.createQueryBuilder(EventEntity, 'e')
      .delete()
      .where(() => `id IN (${
        this.manager.createQueryBuilder(MembershipEntity, 'm')
          .select('event_id')
          .where(`m.email IN (:...emails)`)
          .getQuery()
        })`
      )
      .setParameters({
        emails: appConfig.testUsers
      })
      .execute();
    
    return {
      success: true,
      result: `Deleted ${result.affected} events`
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
