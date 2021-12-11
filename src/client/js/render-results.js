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

const renderWheather = ({
  apparentTemperature,
  className,
  dateFormatted,
  description,
  humidity,
  icon,
  temperature,
  title,
  windSpeed,
}) => `
<article class="${className}">
  <main class="card__weather">
    <div class="card__weather-title">${title}</div>
    <div class="card__weather-date">${dateFormatted}</div>
    <img
      class="card__weather-icon"
      src="${require(`../assets/weather-icons/${icon}.png`)}"
      alt="weather icon"
    />
    <div class="card__weather-temperature">
      ${temperature}<sup>&#8451;</sup> like ${apparentTemperature}<sup>&#8451;</sup>
    </div>
    <div class="card__weather-humidity-wind">H ${humidity}% W ${windSpeed}&#x33A7;</div>
    <div class="card__weather-description">${description}</div>
  </main>
</article>
`;

const renderCurrentWeather = ({ dateString, timezone, ...currentWeather }) => {
  const currentDate = new Date(dateString);
  const currentDateFormatted = [
    getLocaleDateString(currentDate, timezone),
    getLocaleTimeString(currentDate, timezone),
  ].join(' - ');
  return renderWheather({
    ...currentWeather,
    className: 'current',
    title: 'Current Weather',
    dateFormatted: currentDateFormatted,
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
</main>`;

/* eslint-enable global-require, import/no-dynamic-require */
