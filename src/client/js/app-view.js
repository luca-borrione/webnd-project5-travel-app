import { scrollElementIntoView } from './utils/browser-utils';
import { getDaysFromToday } from './utils/date-utils';
import { handleError } from './utils/error-utils';
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
import { renderResultsView, renderSavedTripsView } from './render-view';

const SAVED_TRIPS_KEY = 'savedTrips';

let $form;
let $results;
let $savedTrips;
let $spinner;
let $main;

const storeElements = () => {
  $form = {
    search: document.forms.search,
    destination: document.forms.search.elements['search-form__destination'],
    departure: document.forms.search.elements['search-form__departure'],
    departureDate: document.forms.search.elements['search-form__departure-date'],
    returnDate: document.forms.search.elements['search-form__return-date'],
    button: document.querySelector('.search-form__submit-button'),
  };

  $results = document.querySelector('.results');
  $savedTrips = document.querySelector('.saved-trips');
  $spinner = document.querySelector('.spinner');
  $main = document.querySelector('.main-area');
};

const toggleSpinner = () => {
  $spinner.classList.toggle('hide');
};

const toggleMain = () => {
  $main.classList.toggle('hide');
};

const toggleSubmitButton = () => {
  if ($form.button.classList.contains('loading')) {
    $form.button.disabled = false;
  } else {
    $form.button.disabled = true;
  }
  $form.button.classList.toggle('loading');
};

const saveTripListener = (trip) => (event) => {
  event.preventDefault();
  event.stopPropagation();
  return postSaveTrip({ trip })
    .then((savedTrips) => {
      window.localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(savedTrips));
      $savedTrips.innerHTML = renderSavedTripsView(savedTrips);
    })
    .catch(handleError);
};

export const removeTrip = (tripId) =>
  postRemoveTrip({ tripId })
    .then((savedTrips) => {
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

  toggleSubmitButton();

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
        forecast,
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
            latitude,
            longitude,
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
            weather: forecast?.departureWeather,
          },
          returnInfo: {
            dateString: $form.returnDate.value,
            weather: forecast?.returnWeather,
          },
        };

        $results.innerHTML = renderResultsView(tripCard);

        $results
          .querySelector('.card__button')
          .addEventListener('click', saveTripListener(tripCard));

        toggleSubmitButton();
        scrollElementIntoView($results);
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
    toggleSpinner();
    toggleMain();
  } catch (error) {
    handleError(error);
  }
};

window.document.addEventListener('DOMContentLoaded', init);
