const errors = [];
const handleError = (error) => {
  if (!errors.includes(error)) {
    console.error(error); // eslint-disable-line no-console
    errors.push(error);
  }
};

const handleErrorAndReject = (error) => {
  handleError(error);
  return Promise.reject(error);
};

module.exports = {
  handleError,
  handleErrorAndReject,
};
