import {ASTNode, GraphQLScalarType, Kind} from "graphql";
import {DateTime} from "luxon";

export const DateTimeScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'DateTime custom scalar type',
  serialize(value: DateTime) {
    return value.toISO();
  },
  parseValue(value: string) {
    return DateTime.fromISO(value);
  },
  parseLiteral(ast: ASTNode) {
    if(ast.kind === Kind.STRING) {
      return DateTime.fromISO(ast.value);
    }
  }
});
