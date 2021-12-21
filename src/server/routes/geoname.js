/**
 * GeoName API request
 * http://www.geonames.org/export/web-services.html
 *
 * We use this API to retrieve information of a city given its name.
 * The response this get route is providing contains the data already transformed
 * in the way as the client is expecting them
 */

require('dotenv').config();
const fetch = require('node-fetch');

const GEONAMES_BASEURL = 'http://api.geonames.org/searchJSON';

const getUrl = ({ location }) => {
  const { GEONAMES_USERNAME } = process.env;
  const params = {
    maxRows: 1,
    q: location,
    username: GEONAMES_USERNAME,
  };
  return `${GEONAMES_BASEURL}?${new URLSearchParams(params).toString()}`;
};

const transformData = ({ lat, lng, name, adminName1, countryName, geonameId }) => ({
  city: name,
  country: countryName,
  county: adminName1,
  geonameId,
  latitude: lat,
  longitude: lng,
});

const selectData = (results) => results.geonames[0];

const transformResults = (results) => transformData(selectData(results));

const fetchGeoName = async ({ location }) => {
  const response = await fetch(getUrl({ location }));
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

const geoNameGetRoute = async (req, res) => {
  try {
    const { location } = req.query;
    const response = await fetchGeoName({ location });
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
  geoNameGetRoute,
};
