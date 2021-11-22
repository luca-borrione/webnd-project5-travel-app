require('dotenv').config();
const fetch = require('node-fetch');

const { GEONAMES_USERNAME } = process.env;

const GEONAMES_BASEURL = 'http://api.geonames.org/searchJSON';

module.exports = {
  getGeoName: async (req, res, next) => {
    try {
      const { location } = req.query;
      const params = {
        q: location,
        maxRows: 1,
        username: GEONAMES_USERNAME,
      };
      const response = await fetch(`${GEONAMES_BASEURL}?${new URLSearchParams(params).toString()}`);
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
  },
  getTest: (_, res) => {
    res.send({
      title: 'test json response',
      message: 'it works!',
    });
  },
};
