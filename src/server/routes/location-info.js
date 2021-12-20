require('dotenv').config();
const fetch = require('node-fetch');

const POSITIONSTACK_BASEURL = 'http://api.positionstack.com/v1/reverse';

const getUrl = ({ latitude, longitude }) => {
  const { POSITIONSTACK_APIKEY } = process.env;
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

const transformData = ({
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

const selectData = (results) => results.data[0];

const transformResults = (results) => transformData(selectData(results));

const fetchPositionStack = async ({ latitude, longitude }) => {
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

const locationInfoGetRoute = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    const response = await fetchPositionStack({ latitude, longitude });
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
  locationInfoGetRoute,
};
