import {Field, ObjectType} from "type-graphql";

@ObjectType()
export class SimpleResponse {
  @Field()
  success: boolean;

  @Field()
  result: string;
}
