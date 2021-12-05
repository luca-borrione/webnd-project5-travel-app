import { getData, handleErrorAndReject } from './utils';

// ---- Geo Names ----
const transformGeoNameData = ({ lat, lng, name, adminName1, countryName }) => ({
  county: adminName1,
  destination: name,
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
const transformDestinationPhotoData = ({ webformatURL } = {}) => webformatURL;

const parseDestinationPhotoResponse = (response) =>
  new Promise((resolve, reject) => {
    if (!response.success) {
      reject(new Error(response.message));
    }
    resolve(transformDestinationPhotoData(response.results.hits[0]));
  });

export const getDestinationImage = ({ destination, country }) =>
  getData('/api/destination-image', { destination, country })
    .then(parseDestinationPhotoResponse)
    .catch(handleErrorAndReject);
