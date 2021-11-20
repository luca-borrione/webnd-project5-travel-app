jest.mock('node-fetch');

describe('api-routes-controller', () => {
  let controller;

  beforeEach(() => {
    process.env.API_KEY = 'MOCK-APP-KEY';
    jest.resetModules();
    controller = require('./api-routes-controller'); // eslint-disable-line global-require
  });

  describe('getTest', () => {
    it('should retrieve an empty array if NO entries have been posted', () => {
      const mockRequest = {};
      const mockResponse = { send: jest.fn() };
      controller.getTest(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledTimes(1);
      expect(mockResponse.send.mock.calls[0][0]).toStrictEqual({
        message: 'it works!',
        title: 'test json response',
      });
    });
  });
});
