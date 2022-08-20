import {insert} from "../../utils/typeorm";
import {Session} from "../../models/Session";
import {randomBytes} from "crypto";
import {DateTime} from "luxon";
import {sign} from "../../utils/jwt";
import {pick} from "lodash";

export default async function getNewToken(email: string) {
  const session = await insert(Session, {
    key: randomBytes(16).toString('hex'),
    email,
    authenticated: true,
    expiresOn: DateTime.now().plus({
      minutes: 5
    })
  });

  const token = await sign(pick(session, 'uuid', 'key'));

  return {success: true, result: token};
}
