const express = require('express');
const {
  getPositionInfo,
  getGeoName,
  getTest,
  getThumbnail,
  getCurrentWeather,
} = require('./api-routes-controller');

const router = express.Router();

router.route('/test').get(getTest);
router.route('/geoname').get(getGeoName);
router.route('/position-info').get(getPositionInfo);
router.route('/thumbnail').get(getThumbnail);
router.route('/weather-current').get(getCurrentWeather);

module.exports = router;
