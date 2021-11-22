const express = require('express');
const { getGeoName, getTest } = require('./api-routes-controller');

const router = express.Router();

router.route('/test').get(getTest);
router.route('/geoname').get(getGeoName);

module.exports = router;
