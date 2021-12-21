jest.mock('node-fetch');

describe('geoNameGetRoute', () => {
  let geoNameGetRoute;
  let mockRequest;
  let mockResponse;
  let mockFetch;

  beforeEach(() => {
    geoNameGetRoute = require('./geoname').geoNameGetRoute; // eslint-disable-line global-require
    mockFetch = require('node-fetch'); // eslint-disable-line global-require

    process.env.GEONAMES_USERNAME = 'MOCK-GEONAMES-USERNAME';

    mockRequest = {
      query: { location: 'mock-location' },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should call fetch with the expected protocol hostname and pathname', async () => {
    expect(mockFetch).not.toHaveBeenCalled();
    await geoNameGetRoute(mockRequest, mockResponse);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const { protocol, hostname, pathname } = new URL(mockFetch.mock.calls[0][0]);
    expect(`${protocol}//${hostname}${pathname}`).toBe('http://api.geonames.org/searchJSON');
  });

  it('should call fetch sending the required params in the query', async () => {
    expect(mockFetch).not.toHaveBeenCalled();
    await geoNameGetRoute(mockRequest, mockResponse);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const parsedUrl = new URL(mockFetch.mock.calls[0][0]);
    const queryParams = Object.fromEntries(new URLSearchParams(parsedUrl.search));
    const requiredParams = {
      q: 'mock-location',
      maxRows: '1',
      username: 'MOCK-GEONAMES-USERNAME',
    };
    expect(queryParams).toStrictEqual(requiredParams);
  });

  it('should call fetch sending undefined username if not set in the env', async () => {
    delete process.env.GEONAMES_USERNAME;
    jest.mock('dotenv', () => ({
      config: jest.fn().mockImplementationOnce(() => {}),
    }));
    jest.resetModules();
    geoNameGetRoute = require('./geoname').geoNameGetRoute; // eslint-disable-line global-require
    mockFetch = require('node-fetch'); // eslint-disable-line global-require

    expect(mockFetch).not.toHaveBeenCalled();

    await geoNameGetRoute(mockRequest, mockResponse);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const parsedUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(parsedUrl.searchParams.get('username')).toBe('undefined');
  });

  it('should be unsuccessful and send the failure message when the remote api responds with a non-ok status', async () => {
    const MOCK_FETCH_STATUS = 401;
    mockFetch.mockReturnValueOnce({
      status: MOCK_FETCH_STATUS,
      json: jest.fn().mockReturnValueOnce({
        message: 'mock-failure-message',
      }),
    });

    expect(mockFetch).not.toHaveBeenCalled();

    await geoNameGetRoute(mockRequest, mockResponse);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toBeCalledWith(MOCK_FETCH_STATUS);
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'mock-failure-message',
      success: false,
    });
  });

  it('should be unsuccessful and send the error message when an error occurs', async () => {
    mockFetch.mockReturnValueOnce({
      status: 200,
      json: jest.fn().mockImplementationOnce(() => {
        throw new Error('mock-error-message');
      }),
    });

    expect(mockFetch).not.toHaveBeenCalled();

    await geoNameGetRoute(mockRequest, mockResponse);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toBeCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'mock-error-message',
      success: false,
    });
  });

  it('should be successful correctly transform the results data when the remote api responds with an ok status', async () => {
    const mockGeoName = {
      adminName1: 'mock-county',
      countryName: 'mock-country',
      geonameId: 'mock-geoname-id',
      lat: 'mock-latitude',
      lng: 'mock-longitude',
      name: 'mock-city',
    };
    mockFetch.mockReturnValueOnce({
      status: 200,
      json: jest.fn().mockReturnValueOnce({ geonames: [mockGeoName] }),
    });

    expect(mockFetch).not.toHaveBeenCalled();

    await geoNameGetRoute(mockRequest, mockResponse);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      results: {
        data: {
          city: 'mock-city',
          country: 'mock-country',
          county: 'mock-county',
          geonameId: 'mock-geoname-id',
          latitude: 'mock-latitude',
          longitude: 'mock-longitude',
        },
      },
      success: true,
    });
  });
});
