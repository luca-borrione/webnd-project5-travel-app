import { handleError, selectors } from './utils';
import { getPositionInfo, getGeoName, getDestinationImage } from './app-controller';

let $form;
let $results;

const storeElements = () => {
  $form = {
    search: document.forms.search,
    destination: document.forms.search.elements['search-form__destination'],
    departure: document.forms.search.elements['search-form__departure'],
    departureDate: document.forms.search.elements['search-form__departure-date'],
    returnDate: document.forms.search.elements['search-form__return-date'],
  };

  $results = {
    capital: document.querySelector(selectors.results.capital),
    card: document.querySelector(selectors.results.card),
    continent: document.querySelector(selectors.results.continent),
    country: document.querySelector(selectors.results.country),
    county: document.querySelector(selectors.results.county),
    currency: document.querySelector(selectors.results.currency),
    destination: document.querySelector(selectors.results.destination),
    flag: document.querySelector(selectors.results.flag),
    language: document.querySelector(selectors.results.language),
    offset: document.querySelector(selectors.results.offset),
    subregion: document.querySelector(selectors.results.subregion),
    thumbnail: document.querySelector(selectors.results.thumbnail),
    timezone: document.querySelector(selectors.results.timezone),
  };
};

const updateResultsView = ({
  capital,
  continent,
  country,
  county = 'n/a',
  currencies,
  destination,
  flag,
  languages,
  offset,
  subregion,
  timezone,
  thumbnailUrl = require('../assets/placeholder-destination-thumb.jpg'), // eslint-disable-line global-require, import/no-unresolved, import/no-absolute-path
}) => {
  $results.capital.innerHTML = capital;
  $results.continent.innerHTML = continent;
  $results.country.innerHTML = country;
  $results.county.innerHTML = county;
  $results.currency.innerHTML = currencies.map(({ code, name }) => `${name} (${code})`).join(', ');
  $results.destination.innerHTML = destination;
  $results.flag.innerHTML = flag;
  $results.language.innerHTML = languages.join(', ');
  $results.offset.innerHTML = offset;
  $results.subregion.innerHTML = subregion;
  $results.timezone.innerHTML = timezone;
  $results.thumbnail.src = thumbnailUrl;
};

const onSearchFormSubmit = async (event) => {
  event.preventDefault();
  event.stopPropagation();

  try {
    const { latitude, longitude, destination, county, country } = await getGeoName(
      $form.destination.value
    );

    return Promise.all([
      getPositionInfo({ latitude, longitude }),
      getDestinationImage({ destination, country }),
    ]).then(
      ([
        { capital, continent, currencies, languages, timezone, offset, flag, subregion },
        thumbnailUrl,
      ]) =>
        updateResultsView({
          capital,
          county,
          continent,
          country,
          destination,
          currencies,
          languages,
          timezone,
          offset,
          flag,
          subregion,
          thumbnailUrl,
        })
    );
  } catch (e) {
    return handleError(e);
  }
};

const initEventListeners = () => {
  $form.search.addEventListener('submit', onSearchFormSubmit);
};

const init = () => {
  storeElements();
  initEventListeners();
};

window.document.addEventListener('DOMContentLoaded', init);
