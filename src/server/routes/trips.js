const bent = require('bent');
const { getThumbnail } = require('./thumbnail');
const { handleError } = require('../utils/error-utils');

const getBuffer = bent('buffer');

let savedTrips = [];

const addTripPostRoute = (req, res) => {
  const { trip } = req.body;
  savedTrips = savedTrips.filter(({ id }) => id !== trip.id);
  savedTrips.push(trip);
  res.json({ success: true, results: { data: savedTrips } });
};

const removeTripPostRoute = (req, res) => {
  const { tripId } = req.body;
  savedTrips = savedTrips.filter(({ id }) => id !== tripId);
  res.json({ success: true, results: { data: savedTrips } });
};

const shouldUpdateThumbnail = (thumbnail) =>
  thumbnail
    ? getBuffer(thumbnail)
        .then(() => false)
        .catch(() => true)
    : true;

const updateThumbnail = async ({ city, country }) => {
  try {
    return await getThumbnail({ city, country });
  } catch (e) {
    return undefined;
  }
};

const updateTrip = async (trip) => {
  const {
    thumbnail,
    locationInfo: { city, country },
  } = trip;

  let updatedThumbail = thumbnail;
  if (await shouldUpdateThumbnail(trip.thumbnail)) {
    updatedThumbail = await updateThumbnail({ city, country });
  }

  return {
    ...trip,
    thumbnail: updatedThumbail,
  };
};

const updateTrips = async (trips = []) => Promise.all(trips.map(updateTrip));

const restoreTripsPostRoute = async (req, res) => {
  try {
    const { localStorageTrips } = req.body;
    const restoredTrips = savedTrips.length > 0 ? savedTrips : localStorageTrips;
    savedTrips = await updateTrips(restoredTrips);
    return res.json({
      success: true,
      results: { data: savedTrips },
    });
  } catch (error) {
    handleError(error);
    savedTrips = [];
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addTripPostRoute,
  removeTripPostRoute,
  restoreTripsPostRoute,
};
