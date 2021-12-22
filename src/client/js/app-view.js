import { scrollElementIntoView } from './utils/browser-utils';
import { getDaysFromToday, getUTCDate } from './utils/date-utils';
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

/**
 * Stores references of DOM elements for easier access
 */
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

/**
 * Event listener triggered when clicking on the `Save Trip` button of the trip search results.
 * It sends the trip to the server, which will store it internally and pass the updated array of saved trips.
 * The whole array of saved trips will be re-rendered to update the data and reposition the trip cards correctly.
 */
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

/**
 * Triggered when clicking on the `Remove Trip` button of the individual trip card rendered in the saved trips section.
 * It will send a request to the server to remove the trip by its id,
 * and the server will send back the updated array of saved trips.
 * This will replace the one stored in the device local storage and will be eventually re-rendered.
 */
export const removeTrip = (tripId) =>
  postRemoveTrip({ tripId })
    .then((savedTrips) => {
      localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(savedTrips));
      $savedTrips.innerHTML = renderSavedTripsView(savedTrips);
    })
    .catch(handleError);

/**
 * Triggered when launching the app.
 * It retrieves the array of saved trips from the device local storage and will send this to server,
 * which will decide whether to keep it or to replace it with the session one if available.
 * The server will respond with the chosen array of saved trips with updated data,
 * which will replace the one in the local storage and will be eventually re-rendered.
 */
const restoreSavedTrips = async () => {
  const localStorageTrips = JSON.parse(window.localStorage.getItem(SAVED_TRIPS_KEY));
  const restoredTrips = await postRestoreTrips({ localStorageTrips });
  window.localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(restoredTrips));
  $savedTrips.innerHTML = renderSavedTripsView(restoredTrips);
};

/**
 * Event listener triggered when clicking on the search button of the trip search.
 */
const onSearchFormSubmit = async (event) => {
  event.preventDefault();
  event.stopPropagation();

  // The submit button will be moved to a disabled loading phase
  toggleSubmitButton();

  try {
    const daysFromDeparture = getDaysFromToday($form.departureDate.value);

    // We first need to retrieve basic information of the entered destination from GeoName
    const { latitude, longitude, city, county, country, geonameId } = await getGeoName({
      location: $form.destination.value,
    });

    // We can then use the information retrieved from GeoName to create further requests
    // to retrieve all the data we need to create the trip card
    return Promise.all([
      getLocationInfo({ latitude, longitude }),
      getThumbnail({ city, country }),
      getCurrentWeather({ latitude, longitude }),

      // there are no forecast available above 16 days from today in the WeatherBit API
      // hence we avoid sending out the forecast request in this case
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
        currentWeather,
        forecast,
      ]) => {
        // We create the trip object based on the data collected from the various API requests
        const tripCard = {
          id: getUTCDate($form.departureDate.value).getTime() + geonameId,
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

        // The trip card needs to be rendered
        $results.innerHTML = renderResultsView(tripCard);

        // Only now this button is rendered to the DOM,
        // so we can attach the click event listener to it
        $results
          .querySelector('.card__button')
          .addEventListener('click', saveTripListener(tripCard));

        // The submit button will be moved back to its original state
        toggleSubmitButton();

        // We will try to scroll the results into the view.
        // This is very important for smaller devices
        // where the whole screen is occupied by the search form
        scrollElementIntoView($results);
      }
    );
  } catch (e) {
    return handleError(e);
  }
};

/**
 * Initialises the event listeners when launching the app
 */
const initEventListeners = () => {
  $form.search.addEventListener('submit', onSearchFormSubmit);
};

/**
 * Event handler triggered when launching the app when the DOM content is loaded.
 */
const init = async () => {
  try {
    storeElements();
    initEventListeners();
    await restoreSavedTrips();

    // When launching the app we hide the main area and show a spinner until the saved trips are fully restored.
    toggleSpinner();
    toggleMain();
  } catch (error) {
    handleError(error);
  }
};

window.document.addEventListener('DOMContentLoaded', init);
