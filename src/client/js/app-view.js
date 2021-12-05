import { handleError, selectors } from './utils';
import { gePositionInfo, getGeoName } from './app-controller';

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
    timezone: document.querySelector(selectors.results.timezone),
  };
};

const updateResultsView = (data) => {
  $results.capital.innerHTML = data.capital;
  $results.continent.innerHTML = data.continent;
  $results.country.innerHTML = data.country;
  $results.county.innerHTML = data.county || 'n/a';
  $results.currency.innerHTML = data.currencies
    .map(({ code, name }) => `${name} (${code})`)
    .join(', ');
  $results.destination.innerHTML = data.destination;
  $results.flag.innerHTML = data.flag;
  $results.language.innerHTML = data.languages.join(', ');
  $results.offset.innerHTML = data.offset;
  $results.subregion.innerHTML = data.subregion;
  $results.timezone.innerHTML = data.timezone;
};

const onSearchFormSubmit = async (event) => {
  event.preventDefault();
  event.stopPropagation();

  try {
    const { latitude, longitude, destination, county, country } = await getGeoName(
      $form.destination.value
    );
    const { capital, continent, currencies, languages, timezone, offset, flag, subregion } =
      await gePositionInfo({ latitude, longitude });
    return updateResultsView({
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
    });
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
