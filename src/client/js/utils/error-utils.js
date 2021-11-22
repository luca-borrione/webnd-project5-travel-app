const errors = [];
export const handleError = (error) => {
  if (!errors.includes(error)) {
    console.error(error); // eslint-disable-line no-console
    errors.push(error);
  }
};

export const handleErrorAndReject = (error) => {
  handleError(error);
  return Promise.reject(error);
};
