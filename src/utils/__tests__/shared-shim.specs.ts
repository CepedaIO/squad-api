import {DateTime, Duration, Interval} from "luxon";
import {RangeUtils} from "../shared-shim";

describe('Range Utils - intervalsFor', function() {
  it('should return smaller event scope', function() {
    const result = RangeUtils.intervalsFor(
      Duration.fromObject({ hours: 1 }),
      Interval.fromDateTimes(
        DateTime.fromObject({ hour: 9 }),
        DateTime.fromObject({ hour: 10 })),
      {
        start: DateTime.fromObject({ hour: 8 }),
        end: DateTime.fromObject({ hour: 11 })
      }
    );
  
    expect(result[0].start).toEqual(DateTime.fromObject({ hour: 9 }));
    expect(result[0].end).toEqual(DateTime.fromObject({ hour: 10 }));
  });
  
  it('should return smaller member availability', function() {
    const result = RangeUtils.intervalsFor(
      Duration.fromObject({ hours: 1 }),
      Interval.fromDateTimes(
        DateTime.fromObject({ hour: 8 }),
        DateTime.fromObject({ hour: 11 })
      ), {
        start: DateTime.fromObject({ hour: 9}),
        end: DateTime.fromObject({ hour: 10 })
      }
    );
    
    expect(result[0].start).toEqual(DateTime.fromObject({ hour: 9 }));
    expect(result[0].end).toEqual(DateTime.fromObject({ hour: 10 }));
  });
  
  it('should split and return interval', function() {
    const result = RangeUtils.intervalsFor(
      Duration.fromObject({ hours: 1 }),
      Interval.fromDateTimes(
        DateTime.fromObject({ hour: 8 }),
        DateTime.fromObject({ hour: 11 })
      ), {
        start: DateTime.fromObject({ hour: 9 }),
        end: DateTime.fromObject({ hour: 12 })
      }
    );
    
    
    expect(result.length).toEqual(1);
    expect(result[0].start).toEqual(DateTime.fromObject({ hour: 9 }));
    expect(result[0].end).toEqual(DateTime.fromObject({ hour: 11 }));
  });
  
  it('should not return an interval', function() {
    const result = RangeUtils.intervalsFor(
      Duration.fromObject({ hours: 1 }),
      Interval.fromDateTimes(
        DateTime.fromObject({ hour: 9 }),
        DateTime.fromObject({ hour: 10 })
      ), {
        start: DateTime.fromObject({ hour: 9, minute: 30 }),
        end: DateTime.fromObject({ hour: 10, minute: 30 })
      }
    );
    
    expect(result.length).toEqual(0);
  });
  
  it('should handle when there\'s no overlap', function() {
    const result = RangeUtils.intervalsFor(
      Duration.fromObject({ hours: 1 }),
      Interval.fromDateTimes(
        DateTime.fromObject({ hour: 8 }),
        DateTime.fromObject({ hour: 9 })
      ), {
        start: DateTime.fromObject({ hour: 10 }),
        end: DateTime.fromObject({ hour: 11 })
      }
    );
  
    expect(result.length).toEqual(0);
  });
})
