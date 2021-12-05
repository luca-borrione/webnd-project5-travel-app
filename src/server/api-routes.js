const express = require('express');
const { gePositionInfo, getGeoName, getTest } = require('./api-routes-controller');

const router = express.Router();

router.route('/test').get(getTest);
router.route('/geoname').get(getGeoName);
router.route('/position-info').get(gePositionInfo);

module.exports = router;
