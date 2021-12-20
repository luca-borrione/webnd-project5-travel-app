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
