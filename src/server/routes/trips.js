/**
 * Provides a way to store the saved trips and performs action on them.
 *
 * - saving an individual trip
 * - removing a saved trip by its id
 * - restoring saved trips from a previous session
 */

const bent = require('bent');
const { handleError } = require('../utils/error-utils');
const { getDaysFromToday } = require('../utils/date-utils');
const { getWeatherForecast } = require('./weather-forecast');
const { getThumbnail } = require('./thumbnail');

const getBuffer = bent('buffer');

/**
 * Array storing the saved trips
 */
let savedTrips = [];

// ADD - - - - - - - - - - - - -

/**
 * Pushes a trip to the saved trips array.
 * In case the array contains already an entry for this trip,
 * the previous entry will be removed.
 * Returns the amended saved trips array
 */
const addTripPostRoute = (req, res) => {
  const { trip } = req.body;
  savedTrips = savedTrips.filter(({ id }) => id !== trip.id);
  savedTrips.push(trip);
  res.json({ success: true, results: { data: savedTrips } });
};

// REMOVE - - - - - - - - - - - - -

/**
 * Removes a trip from the saved trip array given its id.
 * Returns the amended saved trips array
 */
const removeTripPostRoute = (req, res) => {
  const { tripId } = req.body;
  savedTrips = savedTrips.filter(({ id }) => id !== tripId);
  res.json({ success: true, results: { data: savedTrips } });
};

// RESTORE - - - - - - - - - - - - -

/**
 * Checks whether the thumbnail url is still valid by trying to buffer it
 * @param {string} thumbnail - url of the thumbnail
 * @returns {Promise<boolean>}
 */
const shouldUpdateThumbnail = (thumbnail) =>
  thumbnail
    ? getBuffer(thumbnail)
        .then(() => false)
        .catch(() => true)
    : Promise.resolve(true);

/**
 * Retrieves a new valid thumbnail url.
 * We cannot use anymore an expired thumbnail url, therfore in case of errors
 * we force the thumbnail to be undefined, which will be replaced by a placeholder in the client.
 * @returns {Promise<string|undefined>}
 */
const fetchThumbnail = async ({ city, country }) => {
  try {
    return await getThumbnail({ city, country });
  } catch (e) {
    return Promise.resolve(undefined);
  }
};

/**
 * Retrieves updated weather forecasts.
 * @returns {Promise}
 */
const fetchWeatherForecast = async ({ latitude, longitude, departureDate, returnDate }) => {
  try {
    return await getWeatherForecast({ latitude, longitude, departureDate, returnDate });
  } catch (e) {
    return Promise.resolve({});
  }
};

/**
 * Checks whether there are updated forecasts available to retrieve
 * by checking if the departure date is within today and 16 days from today,
 * which is the limit of the WeatherBit forecast.
 * @param {string} departureDate - format yyyy-mm-dd
 * @returns {boolean}
 */
const shouldAddWeatherForecast = (departureDate) =>
  getDaysFromToday(departureDate) >= 0 && getDaysFromToday(departureDate) < 16;

/**
 * Helper function to update all the saved trips when restoring:
 * - creating a new valid thumbnail url, if expired
 * - adding fresh new weather forecasts if available
 */
const updateTrip = async (trip) => {
  const {
    locationInfo: { city, country },
  } = trip;

  let { thumbnail } = trip;
  if (await shouldUpdateThumbnail(trip.thumbnail)) {
    thumbnail = await fetchThumbnail({ city, country });
  }

  let forecast = {};
  if (shouldAddWeatherForecast(trip.departureInfo.dateString)) {
    forecast = await fetchWeatherForecast({
      latitude: trip.locationInfo.latitude,
      longitude: trip.locationInfo.longitude,
      departureDate: trip.departureInfo.dateString,
      returnDate: trip.returnInfo.dateString,
    });
  }

  return {
    ...trip,
    thumbnail,
    departureInfo: {
      ...trip.departureInfo,
      weather: forecast.departureWeather,
    },
    returnInfo: {
      ...trip.returnInfo,
      weather: forecast.returnWeather,
    },
  };
};

const updateTrips = async (trips) => Promise.all(trips.map(updateTrip));

/**
 * Expects to receive the array of the trips saved on the local storage.
 * If the server has saved trips, these will be restored,
 * and the ones saved in the local storage will be replaced with these.
 * The candidates to be restored need to be updated.
 */
const restoreTripsPostRoute = async (req, res) => {
  try {
    const { localStorageTrips } = req.body;
    const restoredTrips = savedTrips.length > 0 ? savedTrips : localStorageTrips ?? [];
    savedTrips = await updateTrips(restoredTrips);
    return res.json({
      success: true,
      results: { data: savedTrips },
    });
  } catch (error) {
    handleError(error);
    savedTrips = [];
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addTripPostRoute,
  removeTripPostRoute,
  restoreTripsPostRoute,
};
