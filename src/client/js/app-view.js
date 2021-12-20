import { handleError } from './utils/error-utils';
import { getDaysFromToday } from './utils/date-utils';
import {
  getCurrentWeather,
  getGeoName,
  getLocationInfo,
  getThumbnail,
  getWeatherForecast,
  postRemoveTrip,
  postSaveTrip,
  postRestoreTrips,
} from './app-controller';
import { renderResultsView, renderSavedTripsView } from './render-results';

const SAVED_TRIPS_KEY = 'savedTrips';

let $form;
let $results;
let $savedTrips;

const storeElements = () => {
  $form = {
    search: document.forms.search,
    destination: document.forms.search.elements['search-form__destination'],
    departure: document.forms.search.elements['search-form__departure'],
    departureDate: document.forms.search.elements['search-form__departure-date'],
    returnDate: document.forms.search.elements['search-form__return-date'],
  };

  $results = document.querySelector('.results');

  $savedTrips = document.querySelector('.saved-trips');
};

const saveTripListener = (trip) => (event) => {
  event.preventDefault();
  event.stopPropagation();
  return postSaveTrip({ trip })
    .then(({ results: { data: savedTrips } }) => {
      window.localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(savedTrips));
      $savedTrips.innerHTML = renderSavedTripsView(savedTrips);
    })
    .catch(handleError);
};

export const removeTrip = (tripId) =>
  postRemoveTrip({ tripId })
    .then(({ results: { data: savedTrips } }) => {
      localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(savedTrips));
      $savedTrips.innerHTML = renderSavedTripsView(savedTrips);
    })
    .catch(handleError);

const restoreSavedTrips = async () => {
  const localStorageTrips = JSON.parse(window.localStorage.getItem(SAVED_TRIPS_KEY));
  const restoredTrips = await postRestoreTrips({ localStorageTrips });
  window.localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(restoredTrips));
  $savedTrips.innerHTML = renderSavedTripsView(restoredTrips);
};

const onSearchFormSubmit = async (event) => {
  event.preventDefault();
  event.stopPropagation();

  try {
    const daysFromDeparture = getDaysFromToday($form.departureDate.value);

    const { latitude, longitude, city, county, country, geonameId } = await getGeoName({
      location: $form.destination.value,
    });

    return Promise.all([
      getLocationInfo({ latitude, longitude }),
      getThumbnail({ city, country }),
      getCurrentWeather({ latitude, longitude }),
      daysFromDeparture < 16
        ? getWeatherForecast({
            latitude,
            longitude,
            departureDate: $form.departureDate.value,
            returnDate: $form.returnDate.value,
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
          id: new Date($form.departureDate.value).getTime() + geonameId,
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

        $results.innerHTML = renderResultsView(tripCard);

        $results
          .querySelector('.card__button')
          .addEventListener('click', saveTripListener(tripCard));
      }
    );
  } catch (e) {
    return handleError(e);
  }
};

const initEventListeners = () => {
  $form.search.addEventListener('submit', onSearchFormSubmit);
};

const init = async () => {
  try {
    storeElements();
    initEventListeners();
    await restoreSavedTrips();
  } catch (error) {
    handleError(error);
  }
};

window.document.addEventListener('DOMContentLoaded', init);
