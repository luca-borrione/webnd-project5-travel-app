require('dotenv').config();
const fetch = require('node-fetch');

const GEONAMES_BASEURL = 'http://api.geonames.org/searchJSON';
const POSITIONSTACK_BASEURL = 'http://api.positionstack.com/v1/reverse';
const PIXABAY_BASEURL = 'https://pixabay.com/api';
const WEATHER_CURRENT_BASEURL = 'http://api.weatherbit.io/v2.0/current';
const WEATHER_FORECAST_BASEURL = 'http://api.weatherbit.io/v2.0/forecast/daily';

let savedTrips = [];

const getFetchResponse = (res, next) => async (url) => {
  try {
    const response = await fetch(url);
    const results = await response.json();
    if (response.status !== 200) {
      next(results.message);
      return res.status(response.status).json({
        success: false,
        message: results.message,
      });
    }
    return res.json({
      success: true,
      results,
    });
  } catch (err) {
    next(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getGeoNameUrl = (req) => {
  const { GEONAMES_USERNAME } = process.env;
  const { location } = req.query;
  const params = {
    maxRows: 1,
    q: location,
    username: GEONAMES_USERNAME,
  };
  return `${GEONAMES_BASEURL}?${new URLSearchParams(params).toString()}`;
};

const getPositionStackUrl = (req) => {
  const { POSITIONSTACK_APIKEY } = process.env;
  const { latitude, longitude } = req.query;
  const params = {
    // sun_module: 1,
    access_key: POSITIONSTACK_APIKEY,
    country_module: 1,
    limit: 1,
    query: [latitude, longitude].join(','),
    timezone_module: 1,
  };
  return `${POSITIONSTACK_BASEURL}?${new URLSearchParams(params).toString()}`;
};

const getThumbnailUrl = (req) => {
  const { PIXABAY_APIKEY } = process.env;
  const { city, country } = req.query;

  const params = {
    category: 'travel',
    image_type: 'photo',
    key: PIXABAY_APIKEY,
    // order: 'popular',
    orientation: 'horizontal',
    q: [city, country].filter(Boolean).join(' '),
    safesearch: 'true',
  };
  return `${PIXABAY_BASEURL}?${new URLSearchParams(params).toString()}`;
};

const getCurrentWeatherUrl = (req) => {
  const { WEATHERBIT_APIKEY } = process.env;
  const { latitude, longitude } = req.query;

  const params = {
    key: WEATHERBIT_APIKEY,
    lat: latitude,
    lon: longitude,
  };
  return `${WEATHER_CURRENT_BASEURL}?${new URLSearchParams(params).toString()}`;
};

const getWeatherForecastUrl = (req) => {
  const { WEATHERBIT_APIKEY } = process.env;
  const { latitude, longitude } = req.query;

  const params = {
    key: WEATHERBIT_APIKEY,
    lat: latitude,
    lon: longitude,
  };
  return `${WEATHER_FORECAST_BASEURL}?${new URLSearchParams(params).toString()}`;
};

const postSaveTrips = (req, res) => {
  const { trips } = req.body;
  savedTrips = trips;
  res.json({ success: true, results: { data: savedTrips } });
};

const postSaveTrip = (req, res) => {
  const { trip } = req.body;
  savedTrips = savedTrips.filter(({ id }) => id !== trip.id);
  savedTrips.push(trip);
  res.json({ success: true, results: { data: savedTrips } });
};

const postRemoveTrip = (req, res) => {
  const { tripId } = req.body;
  savedTrips = savedTrips.filter(({ id }) => id !== tripId);
  res.json({ success: true, results: { data: savedTrips } });
};

module.exports = {
  getCurrentWeather: (req, res, next) => getFetchResponse(res, next)(getCurrentWeatherUrl(req)),
  getGeoName: (req, res, next) => getFetchResponse(res, next)(getGeoNameUrl(req)),
  getLocationInfo: (req, res, next) => getFetchResponse(res, next)(getPositionStackUrl(req)),
  getSavedTrips: (_, res) =>
    res.json({
      success: true,
      results: {
        data: savedTrips,
      },
    }),
  getTest: (_, res) =>
    res.send({
      title: 'test json response',
      message: 'it works!',
    }),
  getThumbnail: (req, res, next) => getFetchResponse(res, next)(getThumbnailUrl(req)),
  getWeatherForecast: (req, res, next) => getFetchResponse(res, next)(getWeatherForecastUrl(req)),
  postRemoveTrip,
  postSaveTrip,
  postSaveTrips,
};
