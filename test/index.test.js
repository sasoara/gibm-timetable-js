const { addWeek, showError, formatDate, formatWeekday } = require('../index');

describe(`shows the error message`, () => {
    test(`function 'showError' should exist`, () => {
        expect(showError).toBeDefined();
    });

});

describe(`adds one week to a date`, () => {
    test(`function 'addWeek' should exist`, () => {
        expect(addWeek).toBeDefined();
    });
    test(`the difference between 2 weeks should be 604800000 miliseconds`, () => {
        const firstDate = new Date('January 1, 2000 00:00:00');
        const weekAfterFirstDate = new Date('January 8, 2000 00:00:00');
        expect(addWeek(firstDate)).toEqual(weekAfterFirstDate);
    });

});

describe(`formats the date`, () => {
    test(`function 'formatDate' should exist`, () => {
        expect(formatDate).toBeDefined();
    });
    test(`should format a date to dd.mm.yyyy`, () => {
        const dateString = '2000-01-01';
        expect(formatDate(dateString)).toBe('01.01.2000');
    });
});

describe(`formats the weekday`, () => {
    test(`function 'formatWeekday' should exist`, () => {
        expect(formatWeekday).toBeDefined();
    });
    test(`gives the weekday as term`, () => {
        const dayAsNumber = 0;
        expect(formatWeekday(dayAsNumber)).toBe('Sonntag');
    });
});
