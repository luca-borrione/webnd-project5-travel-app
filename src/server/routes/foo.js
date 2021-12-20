const fooGetRoute = async (_, res) => {
  res.send({
    title: 'test json response',
    message: 'it works!',
  });
};

module.exports = {
  fooGetRoute,
};
