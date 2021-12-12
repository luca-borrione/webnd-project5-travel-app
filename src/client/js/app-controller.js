import { getData } from './utils/controller-utils';
import { handleErrorAndReject } from './utils/error-utils';

// ---- Geo Names ----
const transformGeoNameData = ({ lat, lng, name, adminName1, countryName, geonameId }) => ({
  city: name,
  country: countryName,
  county: adminName1,
  id: geonameId,
  latitude: lat,
  longitude: lng,
});

const parseGeoNameResponse = (response) =>
  new Promise((resolve, reject) => {
    if (!response.success) {
      reject(new Error(response.message));
    }
    resolve(transformGeoNameData(response.results.geonames[0]));
  });

export const getGeoName = (location) =>
  getData('/api/geoname', { location }).then(parseGeoNameResponse).catch(handleErrorAndReject);

// ---- Position Stack ----
const transformPositionInfoData = ({
  continent,
  country_module: {
    capital,
    currencies,
    languages,
    flag,
    global: { subregion },
  },
  timezone_module: { name: timezone, offset_string: offset },
}) => ({
  capital,
  continent,
  currencies: currencies.map(({ code, name }) => ({ code, name })),
  languages: Object.values(languages),
  timezone,
  offset,
  flag,
  subregion,
});

const parsePositionInfoResponse = (response) =>
  new Promise((resolve, reject) => {
    if (!response.success) {
      reject(new Error(response.message));
    }
    resolve(transformPositionInfoData(response.results.data[0]));
  });

export const getLocationInfo = ({ latitude, longitude }) =>
  getData('/api/position-info', { latitude, longitude })
    .then(parsePositionInfoResponse)
    .catch(handleErrorAndReject);

// ---- Destination Photo ----
const parseThumbnailResponse = (response) =>
  new Promise((resolve, reject) => {
    if (!response.success) {
      reject(new Error(response.message));
    }
    resolve(response.results.hits?.[0]?.webformatURL);
  });

export const getThumbnailUrl = ({ city, country }) =>
  getData('/api/thumbnail', { city, country })
    .then(parseThumbnailResponse)
    .catch(handleErrorAndReject);

// ---- Weather Current ----
const transformCurrentWeatherData = ({
  ob_time: dateString,
  rh: humidity,
  temp: temperature,
  weather: { icon, description },
  wind_spd: windSpeed,
}) => ({
  dateString,
  description,
  humidity,
  icon,
  temperature,
  windSpeed,
});

const parseCurrentWeatherResponse = (response) =>
  new Promise((resolve, reject) => {
    if (!response.success) {
      reject(new Error(response.message));
    }
    resolve(transformCurrentWeatherData(response.results.data[0]));
  });

export const getCurrentWeather = ({ latitude, longitude }) =>
  getData('/api/weather-current', { latitude, longitude })
    .then(parseCurrentWeatherResponse)
    .catch(handleErrorAndReject);

// ---- Weather Forecast ----
const transformWeatherForecastData = ({
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

const parseWeatherForecastResponse = ({ response, departureDateString, returnDateString }) =>
  new Promise((resolve, reject) => {
    if (!response.success) {
      reject(new Error(response.message));
    }
    const departureWeatherForecastData = response.results.data.find(
      ({ valid_date: dateString }) => dateString === departureDateString
    );
    const returnWeatherForecastData = response.results.data.find(
      ({ valid_date: dateString }) => dateString === returnDateString
    );
    resolve({
      departure: {
        ...transformWeatherForecastData(departureWeatherForecastData),
      },
      return: returnWeatherForecastData
        ? transformWeatherForecastData(returnWeatherForecastData)
        : undefined,
    });
  });

export const getWeatherForecast = ({
  latitude,
  longitude,
  departureDateString,
  returnDateString,
}) =>
  getData('/api/weather-forecast', { latitude, longitude })
    .then((response) =>
      parseWeatherForecastResponse({ response, departureDateString, returnDateString })
    )
    .catch(handleErrorAndReject);
