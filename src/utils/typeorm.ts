import {DateTime} from "luxon";
import {promote} from "./shared-shim";
import {IAvailabilityBase, Demote} from "squad-shared";
import {ColumnOptions} from "typeorm/decorator/options/ColumnOptions";

export const DateTimeColumn: ColumnOptions = {
  type: Date,
  transformer: {
    to: (value?: DateTime): Date => value?.toJSDate(),
    from: (value: Date): DateTime => DateTime.fromJSDate(value)
  }
};

export const JSONColumn: ColumnOptions = {
  type: 'jsonb',
  transformer: {
    to: (value: IAvailabilityBase[]) => value,
    from: (value: Demote<IAvailabilityBase>[]) => promote(value)
  }
}
