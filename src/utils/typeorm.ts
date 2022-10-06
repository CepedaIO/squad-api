import {DateTime} from "luxon";

export const DateTimeColumn = {
  type: Date,
  transformer: {
    to: (value?: DateTime): Date => value?.toJSDate(),
    from: (value: Date): DateTime => DateTime.fromJSDate(value)
  }
};
