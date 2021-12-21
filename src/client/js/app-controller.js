import { getData, postData } from './utils/controller-utils';
import { handleErrorAndReject } from './utils/error-utils';

/**
 * Response parser which returns a Promise which rejects in case the response status is not ok (200)
 * or resolves selecting the results data.
 * This simlifies notably the code, after having normalised all the requests responses
 * in order to match the pattern of returing the same results data structure.
 * @param {Object} response
 * @returns
 */
const parseResponse = (response) =>
  new Promise((resolve, reject) => {
    if (!response.success) {
      reject(new Error(response.message));
    }
    resolve(response.results.data);
  });

export const getGeoName = ({ location }) =>
  getData('/api/geoname', { location }).then(parseResponse).catch(handleErrorAndReject);

export const getLocationInfo = ({ latitude, longitude }) =>
  getData('/api/location-info', { latitude, longitude })
    .then(parseResponse)
    .catch(handleErrorAndReject);

export const getThumbnail = ({ city, country }) =>
  getData('/api/thumbnail', { city, country }).then(parseResponse).catch(handleErrorAndReject);

export const getCurrentWeather = ({ latitude, longitude }) =>
  getData('/api/weather/current', { latitude, longitude })
    .then(parseResponse)
    .catch(handleErrorAndReject);

export const getWeatherForecast = ({ latitude, longitude, departureDate, returnDate }) =>
  getData('/api/weather/forecast', { latitude, longitude, departureDate, returnDate })
    .then(parseResponse)
    .catch(handleErrorAndReject);

export const postSaveTrip = ({ trip }) =>
  postData('/api/trips/add', { trip }).then(parseResponse).catch(handleErrorAndReject);

export const postRemoveTrip = ({ tripId }) =>
  postData('/api/trips/remove', { tripId }).then(parseResponse).catch(handleErrorAndReject);

export const postRestoreTrips = ({ localStorageTrips }) =>
  postData('/api/trips/restore', { localStorageTrips })
    .then(parseResponse)
    .catch(handleErrorAndReject);
