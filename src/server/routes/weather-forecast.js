require('dotenv').config();
const fetch = require('node-fetch');

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
        departure: transformData(departureData),
        ...(returnData ? { return: transformData(departureData) } : {}),
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

module.exports = {
  weatherForecastGetRoute,
};
