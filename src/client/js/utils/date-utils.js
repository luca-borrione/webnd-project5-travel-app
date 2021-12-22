const MILLISECONDS_IN_A_DAY = 1000 * 60 * 60 * 24;

/**
 * Today's date needs to be provided starting at 00:00:00
 * to match the format yyyy-mm-dd of the dateString passed to `getDaysFromToday`
 * Failing to do so could lead to unexpected results when calculating the difference
 * between the two dates.
 * @returns {Date} - today's date
 */
const getTodayDate = () => {
  const date = new Date(Date.now());
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const day = date.getDate();
  return new Date(year, monthIndex, day);
};

/**
 * Calculates the difference in days comparing today with a given date.
 * @param {string} dateString - string representing the given date, formatted as yyyy-mm-dd
 * @returns {number}
 *  - 0 means that the given date is today
 *  - numbers above 0 are returned if the given date is a future date
 *  - numbers below 0 are returned if the given date is a past date
 */
export const getDaysFromToday = (dateString) => {
  const today = getTodayDate();
  const date = new Date(dateString);
  return Math.ceil((date - today) / MILLISECONDS_IN_A_DAY);
};

export const getDaysDiff = (departureDateString, returnDateString) => {
  const departureDate = new Date(departureDateString);
  const returnDate = new Date(returnDateString);
  return Math.ceil((returnDate - departureDate) / MILLISECONDS_IN_A_DAY);
};
