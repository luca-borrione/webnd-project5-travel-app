const express = require('express');

const { geoNameGetRoute } = require('./routes/geoname');
const { locationInfoGetRoute } = require('./routes/location-info');
const { thumbnailGetRoute } = require('./routes/thumbnail');
const { fooGetRoute } = require('./routes/foo');
const { weatherCurrentGetRoute } = require('./routes/weather-current');
const { weatherForecastGetRoute } = require('./routes/weather-forecast');
const { addTripPostRoute, removeTripPostRoute, restoreTripsPostRoute } = require('./routes/trips');

const router = express.Router();

router.route('/geoname').get(geoNameGetRoute);
router.route('/location-info').get(locationInfoGetRoute);
router.route('/foo').get(fooGetRoute);
router.route('/thumbnail').get(thumbnailGetRoute);
router.route('/weather/current').get(weatherCurrentGetRoute);
router.route('/weather/forecast').get(weatherForecastGetRoute);

router.route('/trips/add').post(addTripPostRoute);
router.route('/trips/remove').post(removeTripPostRoute);
router.route('/trips/restore').post(restoreTripsPostRoute);

module.exports = router;
