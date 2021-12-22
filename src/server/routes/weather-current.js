/**
 * WeatherBit API request
 * https://www.weatherbit.io/api/weather-current
 *
 * We use this API to retrieve information of the current weather of a location,
 * given its latitude and longitude.
 * The response this get route is providing contains the data already transformed
 * in the way as the client is expecting them.
 */

require('dotenv').config();
const fetch = require('node-fetch');

const WEATHER_CURRENT_BASEURL = 'http://api.weatherbit.io/v2.0/current';

const getUrl = ({ latitude, longitude }) => {
  const { WEATHERBIT_APIKEY } = process.env;
  const params = {
    key: WEATHERBIT_APIKEY,
    lat: latitude,
    lon: longitude,
  };
  return `${WEATHER_CURRENT_BASEURL}?${new URLSearchParams(params).toString()}`;
};

const transformData = ({
  ts: observedTimestamp,
  rh: humidity,
  temp: temperature,
  weather: { icon, description },
  wind_spd: windSpeed,
}) => ({
  observedTimestamp,
  description,
  humidity,
  icon,
  temperature,
  windSpeed,
});

const selectData = (results) => results.data[0];

const transformResults = (results) => transformData(selectData(results));

const fetchWeatherCurrent = async ({ latitude, longitude }) => {
  const response = await fetch(getUrl({ latitude, longitude }));
  const results = await response.json();
  if (response.status !== 200) {
    return {
      status: response.status,
      message: results.message,
    };
  }
  return {
    status: response.status,
    results: { data: transformResults(results) },
  };
};

const weatherCurrentGetRoute = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    const response = await fetchWeatherCurrent({ latitude, longitude });
    if (response.status !== 200) {
      return res.status(response.status).json({
        success: false,
        message: response.message,
      });
    }
    return res.json({
      success: true,
      results: response.results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  weatherCurrentGetRoute,
};
