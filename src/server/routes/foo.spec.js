const { fooGetRoute } = require('./foo');

describe('testGetRoute', () => {
  it('should just return a test response', () => {
    const mockRequest = {};
    const mockResponse = { send: jest.fn() };
    fooGetRoute(mockRequest, mockResponse);
    expect(mockResponse.send).toHaveBeenCalledTimes(1);
    expect(mockResponse.send).toHaveBeenCalledWith({
      message: 'it works!',
      title: 'test json response',
    });
  });
});
