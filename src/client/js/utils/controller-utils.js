import { handleErrorAndReject } from './error-utils';

/**
 * Helper function for post requests
 * @param {string} url
 * @param {*} data
 * @returns {Promise}
 */
export const postData = (url, data) =>
  fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .catch(handleErrorAndReject);

/**
 * Helper function for get requests
 * @param {string} url
 * @param {Object} params
 * @returns {Promise}
 */
export const getData = (url, params) => {
  const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
  return fetch(`${url}${queryParams}`)
    .then((response) => response.json())
    .catch(handleErrorAndReject);
};
