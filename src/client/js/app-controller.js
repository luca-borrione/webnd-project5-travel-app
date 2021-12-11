import { getData, handleErrorAndReject } from './utils';

// ---- Geo Names ----
const transformGeoNameData = ({ lat, lng, name, adminName1, countryName }) => ({
  county: adminName1,
  city: name,
  latitude: lat,
  longitude: lng,
  country: countryName,
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

export const getPositionInfo = ({ latitude, longitude }) =>
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

export const getThumbnail = ({ city, country }) =>
  getData('/api/thumbnail', { city, country })
    .then(parseThumbnailResponse)
    .catch(handleErrorAndReject);

// ---- Weather Current ----
const transformCurrentWeatherData = ({
  app_temp: apparentTemperature,
  ob_time: dateString,
  rh: humidity,
  temp: temperature,
  timezone,
  weather: { icon, description },
  wind_spd: windSpeed,
}) => ({
  apparentTemperature,
  dateString,
  description,
  humidity,
  icon,
  temperature,
  timezone,
  windSpeed,
});

const parseCurrentWeatherResponse = (response) =>
  new Promise((resolve, reject) => {
    if (!response.success) {
      reject(new Error(response.message));
    }
    resolve(transformCurrentWeatherData(response.results.data[0]));
  });

export const getCurrentWeather = ({ city, country }) =>
  getData('/api/weather-current', { city, country })
    .then(parseCurrentWeatherResponse)
    .catch(handleErrorAndReject);
