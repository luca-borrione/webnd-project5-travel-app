require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRoutes = require('./api-routes');

const { PORT = 8080 } = process.env;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use(express.static('dist'));

app.use('/api', apiRoutes);

// const server = app.listen(PORT, console.log(`server running on localhost ${PORT}`)); // eslint-disable-line no-console

const server = app.listen(PORT, () => {
  if (!process.env.GEONAMES_USERNAME) {
    console.error('GEONAMES_USERNAME required');
  }
  if (!process.env.WEATHERBIT_APIKEY) {
    console.error('WEATHERBIT_APIKEY required');
  }
  if (!process.env.PIXABAY_APIKEY) {
    console.error('PIXABAY_APIKEY required');
  }
  if (!process.env.POSITIONSTACK_APIKEY) {
    console.error('PIXABAY_APIKEY required');
  }
  console.log(`server running on localhost ${PORT}`);
});

module.exports = {
  app,
  server,
};
