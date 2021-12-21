const bent = require('bent');
const { handleError } = require('../utils/error-utils');
const { getDaysFromToday } = require('../utils/date-utils');
const { getWeatherForecast } = require('./weather-forecast');
const { getThumbnail } = require('./thumbnail');

const getBuffer = bent('buffer');

let savedTrips = [];

const addTripPostRoute = (req, res) => {
  const { trip } = req.body;
  savedTrips = savedTrips.filter(({ id }) => id !== trip.id);
  savedTrips.push(trip);
  res.json({ success: true, results: { data: savedTrips } });
};

const removeTripPostRoute = (req, res) => {
  const { tripId } = req.body;
  savedTrips = savedTrips.filter(({ id }) => id !== tripId);
  res.json({ success: true, results: { data: savedTrips } });
};

const shouldUpdateThumbnail = (thumbnail) =>
  thumbnail
    ? getBuffer(thumbnail)
        .then(() => false)
        .catch(() => true)
    : true;

const fetchThumbnail = async ({ city, country }) => {
  try {
    return await getThumbnail({ city, country });
  } catch (e) {
    return undefined;
  }
};

const fetchWeatherForecast = async ({ latitude, longitude, departureDate, returnDate }) => {
  try {
    return await getWeatherForecast({ latitude, longitude, departureDate, returnDate });
  } catch (e) {
    return {};
  }
};

const shouldAddWeatherForecast = (departureDate) =>
  getDaysFromToday(departureDate) >= 0 && getDaysFromToday(departureDate) < 16;

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
