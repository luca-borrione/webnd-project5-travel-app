/**
 * WeatherBit API request
 * https://www.weatherbit.io/api/weather-forecast-16-day
 *
 * We use this API to retrieve information of the weather forecast,
 * given its latitude and longitude. The limit is 16 days from the current date.
 * The response this get route is providing contains the data already transformed
 * in the way as the client is expecting them.
 *
 * Specifically we are selecting the expected forecast, matching the departure date
 * and the return date. In this way we pass to the client only the forecasts it needs.
 */

require('dotenv').config();
const fetch = require('node-fetch');

const { parseResponse } = require('../utils/request-utils');

const WEATHER_FORECAST_BASEURL = 'http://api.weatherbit.io/v2.0/forecast/daily';

const getUrl = ({ latitude, longitude }) => {
  const { WEATHERBIT_APIKEY } = process.env;
  const params = {
    key: WEATHERBIT_APIKEY,
    lat: latitude,
    lon: longitude,
  };
  return `${WEATHER_FORECAST_BASEURL}?${new URLSearchParams(params).toString()}`;
};

const transformData = ({
  rh: humidity,
  temp: temperature,
  weather: { icon, description },
  wind_spd: windSpeed,
}) => ({
  description,
  humidity,
  icon,
  temperature,
  windSpeed,
});

const selectData = (results, date) => results.data.find(({ valid_date: d }) => d === date);

const fetchWeatherForecast = async ({ latitude, longitude, departureDate, returnDate }) => {
  const response = await fetch(getUrl({ latitude, longitude }));
  const results = await response.json();
  if (response.status !== 200) {
    return {
      status: response.status,
      message: results.message,
    };
  }

  const departureData = selectData(results, departureDate);
  const returnData = selectData(results, returnDate);

  return {
    status: response.status,
    results: {
      data: {
        departureWeather: departureData && transformData(departureData),
        returnWeather: returnData && transformData(returnData),
      },
    },
  };
};

const weatherForecastGetRoute = async (req, res) => {
  try {
    const { latitude, longitude, departureDate, returnDate } = req.query;
    const response = await fetchWeatherForecast({ latitude, longitude, departureDate, returnDate });
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

const getWeatherForecast = ({ latitude, longitude, departureDate, returnDate }) =>
  fetchWeatherForecast({ latitude, longitude, departureDate, returnDate }).then(parseResponse);

module.exports = {
  getWeatherForecast,
  weatherForecastGetRoute,
};
