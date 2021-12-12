/* eslint-disable global-require, import/no-dynamic-require */

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
    { className: 'continent', label: 'Continent', value: continent },
    { className: 'subregion', label: 'Subregion', value: subregion },
    { className: 'country', label: 'Country', value: country },
    { className: 'county', label: 'County', value: county },
    { className: 'capital', label: 'Capital', value: capital },
    {
      className: 'currency',
      label: 'Currency',
      value: currencies.map(({ code, name }) => `${name} (${code})`).join(', '),
    },
    { className: 'language', label: 'Language', value: languages.join(', ') },
    { className: 'timezone-name', label: 'Timezone', value: timezone },
    { className: 'timezone-offset', label: 'Offset', value: offset },
  ]
    .map(
      ({ className, label, value }) =>
        value &&
        `
        <div class="card__info-${className}--label">${label}:</div>
        <div class="card__info-continent--value">${value}</div>
      `
    )
    .join('')}</article>`;

const renderWeather = ({ description, humidity, icon, temperature = '', windSpeed }) => `
  <aside class="weather">
    <img
    class="weather__icon"
    src="${require(`../assets/weather-icons/${icon}.png`)}"
    alt="weather icon"
    />
    ${
      temperature &&
      `<div class="weather__temperature">
      <span>${temperature}<sup>&#8451;</sup></sup></span>
    </div>`
    }

    <div class="weather__extra-info">
    H ${Math.round(humidity)}% W ${Math.round(windSpeed)}&#x33A7;
    </div>
    <div class="weather__description">${description}</div>
  </aside>`;

const renderInfoBox = ({ className, dateFormatted, title, weather = '' }) => `
  <article class="infobox ${className}">
    <div class="infobox__title">${title}</div>
    <div class="infobox__date">${dateFormatted}</div>
    ${weather && renderWeather(weather)}
  </article>`;

const getLocaleDateString = (date, timeZone) =>
  date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone,
  });

const getLocaleTimeString = (date, timeZone) =>
  date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    hour12: true,
    minute: '2-digit',
    timeZone,
  });

const formatDateString = ({
  dateString,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  addTime = false,
}) => {
  const currentDate = new Date(dateString);
  const localeDateString = getLocaleDateString(currentDate, timezone);
  const localeTimeString = addTime ? ` - ${getLocaleTimeString(currentDate, timezone)}` : '';
  return `${localeDateString}${localeTimeString}`;
};

const renderCurrentInfo = ({ dateString, timezone, weather }) =>
  renderInfoBox({
    className: 'current',
    title: 'Current Weather',
    dateFormatted: formatDateString({
      dateString,
      timezone,
      addTime: true,
    }),
    weather,
  });

const renderDepartureInfo = ({ dateString, weather }) =>
  renderInfoBox({
    className: 'departure',
    title: 'Departure',
    dateFormatted: formatDateString({ dateString }),
    weather,
  });

const renderReturnInfo = ({ dateString, weather }) =>
  renderInfoBox({
    className: 'return',
    title: 'Return',
    dateFormatted: formatDateString({ dateString }),
    weather,
  });

const renderCardButton = () => `
  <button class="card__button" type="button">
    <i class="icon-heart-empty"></i>
    <i class="icon-heart"></i>
    <span>Save Trip</span>
  </button>
  `;

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
  ${renderCardButton()}
</main>`;

/* eslint-enable global-require, import/no-dynamic-require */
