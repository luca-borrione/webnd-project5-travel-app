import { getDaysFromToday, getDaysDiff } from './date-utils';

const mockDateString = '2021-12-24';
const mockDate = new Date('2021-12-24');
jest.spyOn(Date, 'now').mockImplementation(() => mockDate);

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
      ${'2021-12-23'} | ${'2021-12-24'} | ${1}
      ${'2021-12-23'} | ${'2022-12-24'} | ${366}
      ${'2021-12-23'} | ${'2021-12-23'} | ${0}
      ${'2021-12-23'} | ${'2021-12-22'} | ${-1}
    `(
      `should return $expected when checking $returnDate against $departureDate`,
      ({ departureDate, returnDate, expected }) => {
        expect(getDaysDiff(departureDate, returnDate)).toBe(expected);
      }
    );
  });
});
