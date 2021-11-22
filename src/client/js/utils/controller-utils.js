import { handleErrorAndReject } from './error-utils.js';

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

export const getData = (url, params) => {
  const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
  return fetch(`${url}${queryParams}`)
    .then((response) => response.json())
    .catch(handleErrorAndReject);
};
