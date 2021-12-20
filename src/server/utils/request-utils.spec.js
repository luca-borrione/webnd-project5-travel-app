const { parseResponse } = require('./request-utils');

describe('request-utils', () => {
  describe('parseResponse', () => {
    it('should correctly resolve, if the response status is 200', () => {
      const response = {
        status: 200,
        results: { data: 'mock-results-data' },
      };
      expect(parseResponse(response)).resolves.toEqual('mock-results-data');
    });

    it('should correctly reject, if the response status is not 200', () => {
      const response = {
        status: 333,
        message: 'mock-error-message',
      };
      const expectedError = new Error('mock-error-message');
      expect(parseResponse(response)).rejects.toEqual(expectedError);
    });
  });
});
