require('dotenv').config();
const fetch = require('node-fetch');

const GEONAMES_BASEURL = 'http://api.geonames.org/searchJSON';
const POSITIONSTACK_BASEURL = 'http://api.positionstack.com/v1/reverse';

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
    q: location,
    maxRows: 1,
    username: GEONAMES_USERNAME,
  };
  return `${GEONAMES_BASEURL}?${new URLSearchParams(params).toString()}`;
};

const getPositionStackUrl = (req) => {
  const { POSITIONSTACK_APIKEY } = process.env;
  const { latitude, longitude } = req.query;
  const params = {
    query: [latitude, longitude].join(','),
    country_module: 1,
    timezone_module: 1,
    // sun_module: 1,
    limit: 1,
    access_key: POSITIONSTACK_APIKEY,
  };
  return `${POSITIONSTACK_BASEURL}?${new URLSearchParams(params).toString()}`;
};

module.exports = {
  getGeoName: (req, res, next) => getFetchResponse(res, next)(getGeoNameUrl(req)),
  gePositionInfo: (req, res, next) => getFetchResponse(res, next)(getPositionStackUrl(req)),
  getTest: (_, res) => {
    res.send({
      title: 'test json response',
      message: 'it works!',
    });
  },
};
