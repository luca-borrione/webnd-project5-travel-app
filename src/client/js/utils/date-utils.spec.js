import {
  formatDateString,
  formatTimestampToLocale,
  getDaysDiff,
  getDaysFromToday,
} from './date-utils';

const mockDateString = '2021-12-24';
jest.spyOn(Date, 'now').mockImplementation(() => mockDateString);

describe('date-utils', () => {
  describe('getDaysFromToday', () => {
    it.each`
      dateString      | expectedDays
      ${'2021-12-23'} | ${-1}
      ${'2021-12-24'} | ${0}
      ${'2021-12-25'} | ${1}
    `(
      `should return $expectedDays when checking $dateString against ${mockDateString}`,
      ({ dateString, expectedDays }) => {
        expect(getDaysFromToday(dateString)).toBe(expectedDays);
      }
    );
  });

  describe('getDaysDiff', () => {
    it.each`
      departureDate   | returnDate      | expected
      ${'2021-12-25'} | ${'2021-12-24'} | ${-1}
      ${'2021-12-24'} | ${'2021-12-24'} | ${0}
      ${'2021-12-23'} | ${'2021-12-24'} | ${1}
      ${'2021-12-23'} | ${'2022-12-24'} | ${366}
    `(
      `should return $expected when checking $returnDate against $departureDate`,
      ({ departureDate, returnDate, expected }) => {
        expect(getDaysDiff(departureDate, returnDate)).toBe(expected);
      }
    );
  });

  describe('formatTimestampToLocale', () => {
    const TS = {
      '2021-12-25': 1640417715,
    };

    it.each`
      dateString      | timezone              | expected
      ${'2021-12-25'} | ${'Europe/London'}    | ${'25 Dec 2021 07:35 am'}
      ${'2021-12-25'} | ${'Australia/Sydney'} | ${'25 Dec 2021 06:35 pm'}
    `('should correcty format $dateString for $timezone', ({ dateString, timezone, expected }) => {
      expect(formatTimestampToLocale({ timestamp: TS[dateString], timezone })).toBe(expected);
    });
  });

  describe('formatDateString', () => {
    it.each`
      dateString      | expected
      ${'2021-12-25'} | ${'25 Dec 2021'}
      ${'2022-01-01'} | ${'1 Jan 2022'}
    `('should correcty format $dateString', ({ dateString, expected }) => {
      expect(formatDateString(dateString)).toBe(expected);
    });
  });
});
