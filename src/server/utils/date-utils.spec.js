import { getDaysFromToday } from './date-utils';

const mockDateString = '2021-12-24';
const mockDate = '2021-12-24';
jest.spyOn(Date, 'now').mockImplementation(() => mockDate);

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
