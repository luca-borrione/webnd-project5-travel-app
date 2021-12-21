/**
 * Response parser which returns a Promise which rejects in case the response status is not ok (200)
 * or resolves selecting the results data.
 * This simlifies notably the code, after having normalised all the requests responses
 * in order to match the pattern of returing the same results data structure.
 * @param {Object} response
 * @returns
 */
const parseResponse = (response) =>
  new Promise((resolve, reject) => {
    if (response.status !== 200) {
      reject(new Error(response.message));
    }
    resolve(response.results.data);
  });

module.exports = {
  parseResponse,
};
