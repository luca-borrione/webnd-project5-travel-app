import { getData, handleErrorAndReject } from './utils';

const parseGeoNameResponse = (response) =>
  new Promise((resolve, reject) => {
    if (!response.success) {
      reject(new Error(response.message));
    }
    resolve(response.results.geonames[0]);
  });

export const getGeoName = (location) =>
  getData('/api/geoname', { location }).then(parseGeoNameResponse).catch(handleErrorAndReject);
