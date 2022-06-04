import {injectable} from "@vlegm/expressman";
import {User} from "../models";
import {BaseService} from "./BaseService";
import {Repository} from "typeorm";

@injectable()
export default class UserService extends BaseService {
  get repository(): Repository<User> {
    return this.manager.getRepository(User);
  }

  create(user: Omit<User, 'id' | 'uuid' | "groups" | "availabilities">): Promise<User> {
    return this.repository.save(user);
  }
}
