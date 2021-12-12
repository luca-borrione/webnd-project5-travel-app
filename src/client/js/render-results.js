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

const renderWeather = ({ className, dateFormatted, title, weather = '' }) => {
  const {
    // apparentMaxTemperature,
    // apparentMinTemperature,
    // apparentTemperature,
    description,
    humidity,
    icon,
    maxTemperature = '',
    minTemperature,
    temperature = '',
    windSpeed,
  } = weather;
  return `
  <article class="${className}">
    <main class="card__weather">
      <div class="card__weather-title">${title}</div>
      <div class="card__weather-date">${dateFormatted}</div>
      ${
        weather &&
        `<img
          class="card__weather-icon"
          src="${require(`../assets/weather-icons/${icon}.png`)}"
          alt="weather icon"
        />
        ${
          temperature &&
          `<div class="card__weather-temperature">
            <span>${temperature}<sup>&#8451;</sup></sup></span>
          </div>`
        }
        ${
          maxTemperature &&
          `<div class="card__weather-temperature">
            <span>max ${maxTemperature}<sup>&#8451;</sup></span>
            <span>min ${minTemperature}<sup>&#8451;</sup></span>
          </div>`
        }
        <div class="card__weather-humidity-wind">
          H ${Math.round(humidity)}% W ${Math.round(windSpeed)}&#x33A7;
        </div>
        <div class="card__weather-description">${description}</div>`
      }
    </main>
  </article>`;
};

const renderCurrentWeather = ({ dateString, timezone, ...currentWeather }) => {
  const currentDate = new Date(dateString);
  const currentDateFormatted = [
    getLocaleDateString(currentDate, timezone),
    getLocaleTimeString(currentDate, timezone),
  ].join(' - ');
  return renderWeather({
    className: 'current',
    title: 'Current Weather',
    dateFormatted: currentDateFormatted,
    weather: currentWeather,
  });
};

const renderDepartureInfo = ({ dateString, weather }) => {
  const departureDate = new Date(dateString);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const departureDateFormatted = [getLocaleDateString(departureDate, timezone)].join(' - ');
  return renderWeather({
    className: 'departure',
    title: 'Departure',
    dateFormatted: departureDateFormatted,
    weather,
  });
};

const renderReturnInfo = ({ dateString, weather }) => {
  const departureDate = new Date(dateString);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const departureDateFormatted = [getLocaleDateString(departureDate, timezone)].join(' - ');
  return renderWeather({
    className: 'return',
    title: 'Return',
    dateFormatted: departureDateFormatted,
    weather,
  });
};

export const renderResultsView = ({
  capital,
  county,
  continent,
  country,
  city,
  currencies,
  languages,
  timezone,
  offset,
  flag,
  subregion,
  thumbnail,
  currentWeather,
  departureInfo,
  returnInfo,
}) => `
<main class="card">
  ${renderThumbnail({
    city,
    flag,
    thumbnail,
  })}
  ${renderLocationInfo({
    continent,
    subregion,
    country,
    county,
    capital,
    currencies,
    languages,
    timezone,
    offset,
  })}
  ${renderCurrentWeather(currentWeather)}
  ${renderDepartureInfo(departureInfo)}
  ${renderReturnInfo(returnInfo)}
</main>`;

/* eslint-enable global-require, import/no-dynamic-require */
