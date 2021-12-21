/**
 * Basic get route to test the express server is set up correctly
 */

const fooGetRoute = async (_, res) => {
  res.send({
    title: 'test json response',
    message: 'it works!',
  });
};

module.exports = {
  fooGetRoute,
};
