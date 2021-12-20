jest.mock('node-fetch');

describe('locationInfoGetRoute', () => {
  let locationInfoGetRoute;
  let mockRequest;
  let mockResponse;
  let mockNext;
  let mockFetch;

  beforeEach(() => {
    locationInfoGetRoute = require('./location-info').locationInfoGetRoute; // eslint-disable-line global-require
    mockFetch = require('node-fetch'); // eslint-disable-line global-require

    process.env.POSITIONSTACK_APIKEY = 'MOCK-POSITIONSTACK-APIKEY';

    mockRequest = {
      query: { latitude: 10, longitude: -10 },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should call fetch with the expected protocol hostname and pathname', async () => {
    expect(mockFetch).not.toHaveBeenCalled();
    await locationInfoGetRoute(mockRequest, mockResponse);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const { protocol, hostname, pathname } = new URL(mockFetch.mock.calls[0][0]);
    expect(`${protocol}//${hostname}${pathname}`).toBe('http://api.positionstack.com/v1/reverse');
  });

  it('should call fetch sending the required params in the query', async () => {
    expect(mockFetch).not.toHaveBeenCalled();
    await locationInfoGetRoute(mockRequest, mockResponse, mockNext);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const parsedUrl = new URL(mockFetch.mock.calls[0][0]);
    const queryParams = Object.fromEntries(new URLSearchParams(parsedUrl.search));
    const requiredParams = {
      access_key: 'MOCK-POSITIONSTACK-APIKEY',
      country_module: '1',
      limit: '1',
      query: '10,-10',
      timezone_module: '1',
    };
    expect(queryParams).toStrictEqual(requiredParams);
  });

  it('should call fetch sending undefined username if not set in the env', async () => {
    delete process.env.POSITIONSTACK_APIKEY;
    jest.mock('dotenv', () => ({
      config: jest.fn().mockImplementationOnce(() => {}),
    }));
    jest.resetModules();
    locationInfoGetRoute = require('./location-info').locationInfoGetRoute; // eslint-disable-line global-require
    mockFetch = require('node-fetch'); // eslint-disable-line global-require

    expect(mockFetch).not.toHaveBeenCalled();

    await locationInfoGetRoute(mockRequest, mockResponse, mockNext);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const parsedUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(parsedUrl.searchParams.get('access_key')).toBe('undefined');
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

    await locationInfoGetRoute(mockRequest, mockResponse);

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

    await locationInfoGetRoute(mockRequest, mockResponse);

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
    const mockPositionInfo = {
      continent: 'mock-continent',
      country_module: {
        capital: 'mock-capital',
        currencies: [
          { name: 'mock-currency1', code: 'cur1', foo: 'to be filtered out' },
          { name: 'mock-currency2', code: 'cur2', foo: 'to be filtered out' },
        ],
        languages: {
          lang1: 'mock-language1',
          lang2: 'mock-language2',
        },
        flag: 'mock-flag',
        global: { subregion: 'mock-subregion' },
      },
      timezone_module: { name: 'mock-timezone', offset_string: 'mock-offset' },
    };
    mockFetch.mockReturnValueOnce({
      status: 200,
      json: jest.fn().mockReturnValueOnce({ data: [mockPositionInfo] }),
    });

    expect(mockFetch).not.toHaveBeenCalled();

    await locationInfoGetRoute(mockRequest, mockResponse);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      results: {
        data: {
          capital: 'mock-capital',
          continent: 'mock-continent',
          currencies: [
            { name: 'mock-currency1', code: 'cur1' },
            { name: 'mock-currency2', code: 'cur2' },
          ],
          languages: ['mock-language1', 'mock-language2'],
          timezone: 'mock-timezone',
          offset: 'mock-offset',
          flag: 'mock-flag',
          subregion: 'mock-subregion',
        },
      },
      success: true,
    });
  });
});
