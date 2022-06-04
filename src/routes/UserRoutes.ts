import {API, POST} from "@vlegm/expressman";
import {User} from "../models";
import UserService from "../services/UserService";

class CreateUserInput implements Omit<User, 'id' | 'uuid' | "groups" | "availabilities"> {
  firstname!: string;
  lastname!: string;
}

@API('/user')
export default class UserRoutes {
  constructor(
    private userService: UserService
  ) { }

  @POST()
  createUser(payload:CreateUserInput): Promise<User> {
    return this.userService.create(payload);
  }
}
