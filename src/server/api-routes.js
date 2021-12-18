const express = require('express');
const {
  getCurrentWeather,
  getGeoName,
  getLocationInfo,
  getTest,
  getThumbnail,
  getWeatherForecast,
  postRemoveTrip,
  postSaveTrip,
  getSavedTrips,
  postSaveTrips,
} = require('./api-routes-controller');

const router = express.Router();

router.route('/test').get(getTest);
router.route('/geoname').get(getGeoName);
router.route('/position-info').get(getLocationInfo);
router.route('/thumbnail').get(getThumbnail);
router.route('/weather-current').get(getCurrentWeather);
router.route('/weather-forecast').get(getWeatherForecast);
router.route('/save-trip').post(postSaveTrip);
router.route('/remove-trip').post(postRemoveTrip);
router.route('/get-saved-trips').get(getSavedTrips);
router.route('/save-trips').post(postSaveTrips);

module.exports = router;
