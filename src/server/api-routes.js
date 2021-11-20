const express = require('express');
const { getTest } = require('./api-routes-controller');

const router = express.Router();

router.route('/test').get(getTest);

module.exports = router;
