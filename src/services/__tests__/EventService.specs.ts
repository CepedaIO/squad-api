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
  
  it.only('should be correct', function() {
    const intervals = [
      [
        {
          "s": "2022-10-02T00:00:00.000-04:00",
          "e": "2022-10-11T23:59:00.000-04:00",
          "invalid": null,
          "isLuxonInterval": true
        }
      ],
      [
        {
          "s": "2022-10-04T00:00:00.000-04:00",
          "e": "2022-10-13T23:59:00.000-04:00",
          "invalid": null,
          "isLuxonInterval": true
        }
      ],
      [
        {
          "s": "2022-10-06T00:00:00.000-04:00",
          "e": "2022-10-15T23:59:00.000-04:00",
          "invalid": null,
          "isLuxonInterval": true
        }
      ],
      [
        {
          "s": "2022-10-08T00:00:00.000-04:00",
          "e": "2022-10-17T23:59:00.000-04:00",
          "invalid": null,
          "isLuxonInterval": true
        }
      ]
    ].map((member) =>
      member.map((part) =>
        Interval.fromDateTimes(
          DateTime.fromISO(part.s),
          DateTime.fromISO(part.e)
        )
      )
    );
    
    const result = eventService.reduceMembershipIntervals(
      Duration.fromDurationLike({ hour: 1 }),
      intervals
    );
    
    result.forEach((part) => {
      console.log(
        part.start.toLocaleString(DateTime.DATE_SHORT),
        ' -> ',
        part.end.toLocaleString(DateTime.DATE_SHORT),
      )
    });
  });
});
