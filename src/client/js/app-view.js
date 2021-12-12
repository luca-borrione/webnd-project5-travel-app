import { handleError } from './utils/error-utils';
import { getDaysFromToday } from './utils/date-utils';
import {
  getCurrentWeather,
  getWeatherForecast,
  getGeoName,
  getPositionInfo,
  getThumbnail,
} from './app-controller';
import { renderResultsView } from './render-results';

let $form;

const storeElements = () => {
  $form = {
    search: document.forms.search,
    destination: document.forms.search.elements['search-form__destination'],
    departure: document.forms.search.elements['search-form__departure'],
    departureDate: document.forms.search.elements['search-form__departure-date'],
    returnDate: document.forms.search.elements['search-form__return-date'],
  };
};

const updateResultsView = (params) => {
  document.querySelector('.results').innerHTML = renderResultsView(params);
};

const onSearchFormSubmit = async (event) => {
  event.preventDefault();
  event.stopPropagation();

  try {
    const daysFromDeparture = getDaysFromToday($form.departureDate.value);

    const { latitude, longitude, city, county, country } = await getGeoName(
      $form.destination.value
    );

    return Promise.all([
      getPositionInfo({ latitude, longitude }),
      getThumbnail({ city, country }),
      getCurrentWeather({ latitude, longitude }),
      daysFromDeparture < 16
        ? getWeatherForecast({
            latitude,
            longitude,
            departureDateString: $form.departureDate.value,
            returnDateString: $form.returnDate.value,
          })
        : Promise.resolve(),
    ]).then(
      ([
        { capital, continent, currencies, languages, timezone, offset, flag, subregion },
        thumbnail,
        currentWeather,
        forecastWeather,
      ]) =>
        updateResultsView({
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
          departureInfo: {
            dateString: $form.departureDate.value,
            weather: forecastWeather?.departure,
          },
          returnInfo: {
            dateString: $form.returnDate.value,
            weather: forecastWeather?.return,
          },
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
