const express = require('express');
const {
  getPositionInfo,
  getGeoName,
  getTest,
  getDestinationImage,
} = require('./api-routes-controller');

const router = express.Router();

router.route('/test').get(getTest);
router.route('/geoname').get(getGeoName);
router.route('/position-info').get(getPositionInfo);
router.route('/destination-image').get(getDestinationImage);

module.exports = router;
