/**
 * Keeping a private record of the unique errors which have been raised
 */
const errors = [];

/**
 * An error which hasn't been raised already will be handled and then added to the private list.
 * Currently the error handling is merely a console log. In fuure this could be expanded in order
 * to display an error message with an error code to the user.
 * @param {Error} error
 */
export const handleError = (error) => {
  if (!errors.includes(error)) {
    console.error(error); // eslint-disable-line no-console
    errors.push(error);
  }
};

/**
 * Same as handleError but to be used when chaining promises in order to have a useful indication
 * as per where the error generated, even though the error itself will be handled elsewhere in the code.
 * @param {Error} error
 * @returns
 */
export const handleErrorAndReject = (error) => {
  handleError(error);
  return Promise.reject(error);
};
