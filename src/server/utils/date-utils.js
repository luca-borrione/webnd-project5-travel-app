const MILLISECONDS_IN_A_DAY = 1000 * 60 * 60 * 24;

/**
 * Converts a date representation into a UTC date at 00:00,
 * which means considering only year, month and date.
 * @param {string|number} dateRepresentation
 * Representation of the date either as a string in `yyyy-mm-dd` format
 * or as milliseconds elapsed since the UNIX epoch.
 * @returns {Date} - UTC Date
 */
const getUTCDate = (dateRepresentation) => {
  const date = new Date(dateRepresentation);
  const year = date.getUTCFullYear();
  const monthIndex = date.getUTCMonth();
  const day = date.getUTCDate();
  return new Date(Date.UTC(year, monthIndex, day));
};

/**
 * Calculates the difference in days comparing today with a given date.
 * @param {string} dateString - string representing the given date, formatted as yyyy-mm-dd
 * @returns {number}
 *  - 0 means that the given date is today
 *  - numbers above 0 are returned if the given date is a future date
 *  - numbers below 0 are returned if the given date is a past date
 */
const getDaysFromToday = (dateString) => {
  const today = getUTCDate(Date.now());
  const date = getUTCDate(dateString);
  return Math.ceil((date - today) / MILLISECONDS_IN_A_DAY);
};

module.exports = {
  getDaysFromToday,
};
