require('dotenv').config();
const fetch = require('node-fetch');

const { parseResponse } = require('../utils/request-utils');

const PIXABAY_BASEURL = 'https://pixabay.com/api';

const getUrl = ({ city, country }) => {
  const { PIXABAY_APIKEY } = process.env;
  const params = {
    category: 'travel',
    image_type: 'photo',
    key: PIXABAY_APIKEY,
    // order: 'popular',
    orientation: 'horizontal',
    q: [city, country].filter(Boolean).join(' '),
    safesearch: 'true',
  };
  return `${PIXABAY_BASEURL}?${new URLSearchParams(params).toString()}`;
};

const selectData = (results) => results?.hits?.[0]?.webformatURL;

const fetchThumbnail = async ({ city, country }) => {
  const response = await fetch(getUrl({ city, country }));
  const results = await response.json();
  if (response.status !== 200) {
    return {
      status: response.status,
      message: results.message,
    };
  }
  return {
    status: response.status,
    results: { data: selectData(results) },
  };
};

const thumbnailGetRoute = async (req, res) => {
  try {
    const { city, country } = req.query;
    const response = await fetchThumbnail({ city, country });
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

const getThumbnail = async ({ city, country }) => {
  const response = await fetchThumbnail({ city, country });
  return parseResponse(response);
};

module.exports = {
  getThumbnail,
  thumbnailGetRoute,
};
