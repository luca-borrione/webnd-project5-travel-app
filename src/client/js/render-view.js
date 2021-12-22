/* eslint-disable global-require, import/no-dynamic-require */

import {
  formatDateString,
  formatTimestampToLocale,
  getDaysDiff,
  getDaysFromToday,
  getUTCDate,
} from './utils/date-utils';

/**
 * A corner ribbon is rendered on the saved trips.
 * This will show how many days are left from the departure date,
 * or it will indicate that the trip expired.
 */
const renderCornerRibbon = ({ daysFromDeparture }) => {
  const expired = daysFromDeparture < 0;

  let message;
  if (expired) {
    message = 'expired';
  } else if (daysFromDeparture === 0) {
    message = 'today';
  } else if (daysFromDeparture === 1) {
    message = 'tomorrow';
  } else {
    message = `in ${daysFromDeparture} days`;
  }

  return `
    <div class="ribbon ${
      (expired && 'ribbon-top-right') || 'ribbon-top-left'
    }"><span>${message}</span></div>
  `;
};

/**
 * The thumbnail image is rendered together with a caption,
 * which is the name of the city and the flag of its country.
 */
const renderThumbnail = ({
  city,
  flag,
  thumbnail = require('../assets/placeholder-destination-thumb.jpg'),
}) => `
<figure class="card__image">
  <img
    class="card__image-thumbnail"
    src="${thumbnail}"
    alt="view of the destination"
  />
  <figcaption class="card__image-caption">
    <span class="card__image-caption-flag">${flag}</span>
    <span class="card__image-caption-city">${city}</span>
  </figcaption>
</figure>
`;

/**
 * A grid with information about the country of the trip destination.
 */
const renderLocationInfo = ({
  continent,
  subregion,
  country,
  county,
  capital,
  currencies,
  languages,
  timezone,
  offset,
}) =>
  `<article class="card__info">${[
    { label: 'Continent', value: continent },
    { label: 'Subregion', value: subregion },
    { label: 'Country', value: country },
    { label: 'County', value: county },
    { label: 'Capital', value: capital },
    {
      label: 'Currency',
      value: currencies.map(({ code, name }) => `${name} (${code})`).join(', '),
    },
    { label: 'Language', value: languages.join(', ') },
    { label: 'Timezone', value: timezone },
    { label: 'Offset', value: offset },
  ]
    .map(
      ({ label, value }) =>
        value &&
        `
          <div class="card__info-entry">
            <div class="label">${label}:</div>
            <div class="value">${value}</div>
          </div>
        `
    )
    .join('')}</article>`;

/**
 * Helper function to render the weather info:
 * - weather icon and description
 * - temperature in celsius
 * - humidity and wind speed
 */
const renderWeather = ({ description, humidity, icon, temperature, windSpeed }) => `
  <aside class="weather">
    <img
    class="weather__icon"
    src="${require(`../assets/weather-icons/${icon}.png`)}"
    alt="weather icon"
    />
    <div class="weather__temperature">
      <span>${temperature}<sup>&#8451;</sup></span>
    </div>
    <div class="weather__extra-info">
    H ${Math.round(humidity)}% W ${Math.round(windSpeed)}&#x33A7;
    </div>
    <div class="weather__description">${description}</div>
  </aside>`;

/**
 * Helper function to render a box containing a date and the weather info if available
 */
const renderInfoBox = ({ className, dateFormatted, title, weather = '' }) => `
  <article class="infobox ${className}">
    <div class="infobox__title">${title}</div>
    <div class="infobox__date">${dateFormatted}</div>
    ${weather && renderWeather(weather)}
  </article>`;

/**
 * Current locale date and weather at destination
 */
const renderCurrentInfo = ({ timezone, weather }) =>
  renderInfoBox({
    className: 'current',
    title: 'Last Observed',
    dateFormatted: formatTimestampToLocale({
      timestamp: weather.observedTimestamp,
      timezone,
    }),
    weather,
  });

/**
 * Date and weather forecast if available when departing
 */
const renderDepartureInfo = ({ dateString, weather }) =>
  renderInfoBox({
    className: 'departure',
    title: 'Departure',
    dateFormatted: formatDateString(dateString),
    weather,
  });

/**
 * Date and weather forecast if available when returning
 */
const renderReturnInfo = ({ dateString, weather }) =>
  renderInfoBox({
    className: 'return',
    title: 'Return',
    dateFormatted: formatDateString(dateString),
    weather,
  });

const renderDaysDiff = (departureDateString, returnDateString) => `
  <aside class="days-diff">
    <div class="days-diff__title">Length:</div>
    <div class="days-diff__value">${getDaysDiff(departureDateString, returnDateString)} days</div>
  </aside>`;

/**
 * `Save Trip` button rendered on the results trip card
 */
const renderCardButton = () => `
  <button class="card__button" type="button">
    <i class="icon-heart-empty"></i>
    <i class="icon-heart"></i>
    <span>Save Trip</span>
  </button>
  `;

/**
 * `Remove Trip` button rendered on the individual saved trip card
 */
const renderRemoveTripButton = (tripId) => `
  <button class="card__button" type="button" onClick="return Client.removeTrip(${tripId})">
    <i class="icon-heart-empty"></i>
    <i class="icon-heart"></i>
    <span>Remove Trip</span>
  </button>
  `;

/**
 * Rendering the results
 */
export const renderResultsView = ({
  thumbnail,
  locationInfo: { city, flag, ...locationInfo },
  currentInfo,
  departureInfo,
  returnInfo,
}) => `
<main class="card">
  ${renderThumbnail({ thumbnail, city, flag })}
  ${renderLocationInfo(locationInfo)}
  ${renderCurrentInfo(currentInfo)}
  ${renderDepartureInfo(departureInfo)}
  ${renderReturnInfo(returnInfo)}
  ${renderDaysDiff(departureInfo.dateString, returnInfo.dateString)}
  ${renderCardButton()}
</main>`;

/**
 * Saved trips will be rendered sorted by the date by date ascending
 * Example:
 * 21 Dec 2021 - 22 Dec 2021 - 3 Feb 2022
 */
const byDateAscending = (a, b) =>
  getUTCDate(a.departureInfo.dateString) - getUTCDate(b.departureInfo.dateString);

/**
 * Expired trip card will be moved to the end of the list,
 * keeping the ascending order by date
 */
const moveExpiredTripsToTheEnd = (savedTrips) =>
  savedTrips
    .reduce(
      (acc, trip) => {
        if (getDaysFromToday(trip.departureInfo.dateString) < 0) {
          acc[1] = [...acc[1], trip];
        } else {
          acc[0] = [...acc[0], trip];
        }
        return acc;
      },
      [[], []]
    )
    .flat();

/**
 * Helper function to sort the array of the saved list
 */
const sortSavedTrips = (savedTrips) => moveExpiredTripsToTheEnd(savedTrips.sort(byDateAscending));

/**
 * Rendering the whole array of saved trips.
 * Expired trip card will be displayed with a different UI
 */
export const renderSavedTripsView = (savedTrips) =>
  sortSavedTrips(savedTrips).reduce(
    (acc, { id: tripId, thumbnail, locationInfo: { city, flag }, departureInfo, returnInfo }) => {
      const daysFromDeparture = getDaysFromToday(departureInfo.dateString);
      const expired = daysFromDeparture < 0;
      return `
        ${acc}
        <main class="card${(expired && ' expired') || ''}" id="${tripId}">
          ${renderCornerRibbon({ daysFromDeparture })}
          ${renderThumbnail({ thumbnail, city, flag })}
          ${renderDepartureInfo(departureInfo)}
          ${renderReturnInfo(returnInfo)}
          ${renderDaysDiff(departureInfo.dateString, returnInfo.dateString)}
          ${renderRemoveTripButton(tripId)}
        </main>
      `;
    },
    ''
  );

/* eslint-enable global-require, import/no-dynamic-require */
