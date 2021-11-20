module.exports = {
  getTest: (_, res) => {
    res.send({
      title: 'test json response',
      message: 'it works!',
    });
  },
};
