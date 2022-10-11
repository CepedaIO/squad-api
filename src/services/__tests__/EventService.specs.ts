import {Interval, DateTime, Duration} from "luxon"
import EventService from "../EventService";
import {createTestContainer} from "../../jest";

describe('EventService - reduceMembershipIntervals', function() {
  let eventService:EventService;
  
  beforeEach(() => {
    const container = createTestContainer();
    eventService = container.get(EventService);
  });
  
  it('should match intervals', function() {
    const result = eventService.reduceMembershipIntervals(
      Duration.fromDurationLike({ hour: 1 }),
      [
        [
          Interval.fromDateTimes(
            DateTime.fromObject({ hour: 3 }),
            DateTime.fromObject({ hour: 5 })
          )
        ], [
        Interval.fromDateTimes(
          DateTime.fromObject({ hour: 3, minute: 30 }),
          DateTime.fromObject({ hour: 4, minute: 30 })
        )
      ]
      ]
    );
    
    expect(result.length).toEqual(1);
    expect(result[0]).toEqual(Interval.fromDateTimes(
      DateTime.fromObject({ hour: 3, minute: 30 }),
      DateTime.fromObject({ hour: 4, minute: 30 })
    ));
  })
  
  it('should not match intervals', function() {
    const result = eventService.reduceMembershipIntervals(
      Duration.fromDurationLike({ hour: 1 }),
      [
        [
          Interval.fromDateTimes(
            DateTime.fromObject({ hour: 3 }),
            DateTime.fromObject({ hour: 4 })
          )
          ], [
          Interval.fromDateTimes(
            DateTime.fromObject({ hour: 3, minute: 30 }),
            DateTime.fromObject({ hour: 4, minute: 30 })
          )
        ]
      ]
    );
    
    expect(result.length).toEqual(0);
  });
});

describe('EventService - getAvailabilityIntervals', function() {
  let eventService:EventService;
  
  beforeEach(() => {
    const container = createTestContainer();
    eventService = container.get(EventService);
  });
  
  it('should create availabilities by merging interval results', function() {
    const result = eventService.getAllMembershipIntervals(
      Duration.fromDurationLike({ hour: 1 }), [
        Interval.fromDateTimes(
          DateTime.fromObject({ hour: 9 }),
          DateTime.fromObject({ hour: 11 })
        ),
        Interval.fromDateTimes(
          DateTime.fromObject({ hour: 8 }),
          DateTime.fromObject({ hour: 10 })
        )
      ], [
        [
          {
            start: DateTime.fromObject({ hour: 9 }),
            end: DateTime.fromObject({ hour: 10 })
          }, {
            start: DateTime.fromObject({ hour: 10 }),
            end: DateTime.fromObject({ hour: 11 })
          }
        ]
      ]
    )
    
    const memberIntervals = result[0];
    expect(memberIntervals.length).toEqual(1);
    expect(memberIntervals[0].start).toEqual(DateTime.fromObject({ hour: 9 }));
    expect(memberIntervals[0].end).toEqual(DateTime.fromObject({ hour: 11 }));
  });
});
