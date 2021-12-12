import { handleError } from './utils/error-utils';
import { getDaysFromToday } from './utils/date-utils';
import {
  getCurrentWeather,
  getWeatherForecast,
  getGeoName,
  getLocationInfo,
  getThumbnailUrl,
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

    const { latitude, longitude, city, county, country, id } = await getGeoName(
      $form.destination.value
    );

    return Promise.all([
      getLocationInfo({ latitude, longitude }),
      getThumbnailUrl({ city, country }),
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
        { dateString: currentDateString, ...currentWeather },
        forecastWeather,
      ]) => {
        const tripCard = {
          id,
          thumbnail,
          locationInfo: {
            capital,
            city,
            continent,
            country,
            county,
            currencies,
            flag,
            languages,
            offset,
            subregion,
            timezone,
          },
          currentInfo: {
            dateString: currentDateString,
            timezone,
            weather: currentWeather,
          },
          departureInfo: {
            dateString: $form.departureDate.value,
            weather: forecastWeather?.departure,
          },
          returnInfo: {
            dateString: $form.returnDate.value,
            weather: forecastWeather?.return,
          },
        };
        updateResultsView(tripCard);
      }
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
