import {DateTime, Interval} from "luxon";
import {Demote, IAvailabilityBase, IRangeForm} from "event-matcher-shared";

/**
 * This is functionality ported over from squad-shared because Node doesn't support ESM
 */
export const ist = <T>(test: (obj:any) => boolean) => (obj:any): obj is T => test(obj);

const dateFields = ['createdOn', 'modifiedOn', 'expiresOn', 'start', 'end'];
export const promote = <T>(entity: Demote<T> | T): T => {
  const result:any = Array.isArray(entity) ? [] : {};
  for(const [key, val] of Object.entries(entity)) {
    if(Array.isArray(val)) {
      result[key] = val.map((v) => promote(v));
    } else if(typeof val === 'object' && val !== null) {
      result[key] = promote(val);
    } else if(typeof val === 'string' && dateFields.includes(key)) {
      try {
        result[key] = DateTime.fromISO(val);
      } catch(e) {
        console.error(`Unable to convert: [${key}, ${val}]`);
        result[key] = val;
      }
    } else {
      result[key] = val;
    }
  }
  
  return result;
};

export interface IAvailabilityUtils<AvailabilityType extends IAvailabilityBase> {
  applies: (form: any) => form is AvailabilityType;
  intersection: (scopes: Interval[], form: AvailabilityType) => Interval[];
}

export const RangeUtils: IAvailabilityUtils<IRangeForm> = {
  applies: ist<IRangeForm>((obj) => DateTime.isDateTime(obj.start) && DateTime.isDateTime(obj.end)),
  intersection: (scopes: Interval[], form: IRangeForm) =>
    scopes.reduce((intervals, scope) => {
      const interval = scope.intersection(Interval.fromDateTimes(form.start, form.end))
      return interval ? intervals.concat(interval) : intervals;
    }, [])
};

export const AvailabilityHelpers = [RangeUtils];
export const availabilityHelperFor = (form: IAvailabilityBase | Demote<IAvailabilityBase>) =>
  AvailabilityHelpers.find((helper) =>
    helper.applies(form)
  )!

export const AvailabilityUtils = {
  ist: (obj:any): obj is IAvailabilityBase[] =>
    typeof availabilityHelperFor(obj) !== "undefined",
  intersection: (scopes:Interval[], availabilities: IAvailabilityBase[]): Interval[] => {
    return availabilities.reduce((intervals, availability) => {
      const helper = availabilityHelperFor(availability);
      const interval = helper.intersection(scopes, availability);
      
      return intervals.concat(interval);
    }, []);
  }
}
