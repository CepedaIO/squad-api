import {AuthChecker} from "type-graphql";

export const customAuthChecker: AuthChecker<Context> = (
  { root, args, context, info },
  roles,
) => {
  args

  return true; // or false if access is denied
};
