require('dotenv').config();
const fetch = require('node-fetch');

const GEONAMES_BASEURL = 'http://api.geonames.org/searchJSON';
const POSITIONSTACK_BASEURL = 'http://api.positionstack.com/v1/reverse';
const PIXABAY_BASEURL = 'https://pixabay.com/api/';

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

const getDestinationImageUrl = (req) => {
  const { PIXABAY_APIKEY } = process.env;
  const { destination, country } = req.query;

  const params = {
    category: 'travel',
    image_type: 'photo',
    key: PIXABAY_APIKEY,
    // order: 'popular',
    orientation: 'horizontal',
    q: `${destination} ${country}`,
    safesearch: 'true',
  };
  return `${PIXABAY_BASEURL}?${new URLSearchParams(params).toString()}`;
};

module.exports = {
  getDestinationImage: (req, res, next) => getFetchResponse(res, next)(getDestinationImageUrl(req)),
  getGeoName: (req, res, next) => getFetchResponse(res, next)(getGeoNameUrl(req)),
  getPositionInfo: (req, res, next) => getFetchResponse(res, next)(getPositionStackUrl(req)),
  getTest: (_, res) => {
    res.send({
      title: 'test json response',
      message: 'it works!',
    });
  },
};
