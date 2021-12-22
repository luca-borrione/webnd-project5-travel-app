const MILLISECONDS_IN_A_DAY = 1000 * 60 * 60 * 24;

/**
 * Converts a date representation into a UTC date at 00:00,
 * which means considering only year, month and date.
 * @param {string|number} dateRepresentation
 * Representation of the date either as a string in `yyyy-mm-dd` format
 * or as milliseconds elapsed since the UNIX epoch.
 * @returns {Date} - UTC Date
 */
export const getUTCDate = (dateRepresentation) => {
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
export const getDaysFromToday = (dateString) => {
  const today = getUTCDate(Date.now());
  const date = getUTCDate(dateString);
  return Math.ceil((date - today) / MILLISECONDS_IN_A_DAY);
};

export const getDaysDiff = (departureDateString, returnDateString) => {
  const departureDate = getUTCDate(departureDateString);
  const returnDate = getUTCDate(returnDateString);
  return Math.ceil((returnDate - departureDate) / MILLISECONDS_IN_A_DAY);
};

/**
 * Helper function to format the locale date
 */
const getLocaleDateString = (date, timeZone) =>
  date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone,
  });

/**
 * Helper function to format the locale time
 */
const getLocaleTimeString = (date, timeZone) =>
  date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    hour12: true,
    minute: '2-digit',
    timeZone,
  });

/**
 * Formats a given unix timestamp using a locale timezone
 * @param {Object} p
 * @param {string} p.timestamp - unix timestamp
 * @param {string} p.timezone - locale timezone e.g. `Europe/London`
 * @returns {string} - formatted date string example `20 Dec 2021 06:30pm`
 */
export const formatTimestampToLocale = ({ timezone, timestamp }) => {
  const currentDate = new Date(timestamp * 1000);
  const localeDateString = getLocaleDateString(currentDate, timezone);
  const localeTimeString = getLocaleTimeString(currentDate, timezone);
  return `${localeDateString} ${localeTimeString}`;
};

/**
 * Formats a given date string
 * @param {string} dateString - formatted as `yyyy-mm-dd`
 * @returns {string} - re-formatted date string example `20 Dec 2021`
 */
export const formatDateString = (dateString) => {
  const [, year, month, day] = dateString.match(/(\d{4})-(\d{2})-(\d{2})/);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
