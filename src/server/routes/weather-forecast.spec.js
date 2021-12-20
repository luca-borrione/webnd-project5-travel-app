jest.mock('node-fetch');

describe('weatherForecastGetRoute', () => {
  let weatherForecastGetRoute;
  let mockRequest;
  let mockResponse;
  let mockNext;
  let mockFetch;

  const mockFetchResult = {
    rh: 'mock-humidity',
    temp: 'mock-temperature',
    weather: { icon: 'mock-icon', description: 'mock-description' },
    wind_spd: 'mock-wind-speed',
  };

  beforeEach(() => {
    weatherForecastGetRoute = require('./weather-forecast').weatherForecastGetRoute; // eslint-disable-line global-require
    mockFetch = require('node-fetch'); // eslint-disable-line global-require

    process.env.WEATHERBIT_APIKEY = 'MOCK-WEATHERBIT-APIKEY';

    mockRequest = {
      query: {
        latitude: 'mock-latitude',
        longitude: 'mock-longitude',
        departureDate: 'mock-departure-date',
        returnDate: 'mock-return-date',
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should call fetch with the expected protocol hostname and pathname', async () => {
    expect(mockFetch).not.toHaveBeenCalled();
    await weatherForecastGetRoute(mockRequest, mockResponse);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const { protocol, hostname, pathname } = new URL(mockFetch.mock.calls[0][0]);
    expect(`${protocol}//${hostname}${pathname}`).toBe(
      'http://api.weatherbit.io/v2.0/forecast/daily'
    );
  });

  it('should call fetch sending the required params in the query', async () => {
    expect(mockFetch).not.toHaveBeenCalled();
    await weatherForecastGetRoute(mockRequest, mockResponse);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const parsedUrl = new URL(mockFetch.mock.calls[0][0]);
    const queryParams = Object.fromEntries(new URLSearchParams(parsedUrl.search));
    const requiredParams = {
      lat: 'mock-latitude',
      lon: 'mock-longitude',
      key: 'MOCK-WEATHERBIT-APIKEY',
    };
    expect(queryParams).toStrictEqual(requiredParams);
  });

  it('should call fetch sending undefined username if not set in the env', async () => {
    delete process.env.WEATHERBIT_APIKEY;
    jest.mock('dotenv', () => ({
      config: jest.fn().mockImplementationOnce(() => {}),
    }));
    jest.resetModules();
    weatherForecastGetRoute = require('./weather-forecast').weatherForecastGetRoute; // eslint-disable-line global-require
    mockFetch = require('node-fetch'); // eslint-disable-line global-require

    expect(mockFetch).not.toHaveBeenCalled();

    await weatherForecastGetRoute(mockRequest, mockResponse, mockNext);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const parsedUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(parsedUrl.searchParams.get('key')).toBe('undefined');
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

    await weatherForecastGetRoute(mockRequest, mockResponse);

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

    await weatherForecastGetRoute(mockRequest, mockResponse);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toBeCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'mock-error-message',
      success: false,
    });
  });

  it('should be successful and correctly transform the results data when the remote api responds with an ok status', async () => {
    mockFetch.mockReturnValueOnce({
      status: 200,
      json: jest.fn().mockReturnValueOnce({
        data: [
          { ...mockFetchResult, valid_date: 'mock-departure-date' },
          { ...mockFetchResult, valid_date: 'mock-return-date' },
        ],
      }),
    });

    expect(mockFetch).not.toHaveBeenCalled();

    await weatherForecastGetRoute(mockRequest, mockResponse);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      results: {
        data: {
          departure: {
            description: 'mock-description',
            humidity: 'mock-humidity',
            icon: 'mock-icon',
            temperature: 'mock-temperature',
            windSpeed: 'mock-wind-speed',
          },
          return: {
            description: 'mock-description',
            humidity: 'mock-humidity',
            icon: 'mock-icon',
            temperature: 'mock-temperature',
            windSpeed: 'mock-wind-speed',
          },
        },
      },
      success: true,
    });
  });

  it('should be successful and correctly transform the results data when the remote api responds with an ok status, but there is no weather forecast available for the return date', async () => {
    mockFetch.mockReturnValueOnce({
      status: 200,
      json: jest.fn().mockReturnValueOnce({
        data: [{ ...mockFetchResult, valid_date: 'mock-departure-date' }],
      }),
    });

    expect(mockFetch).not.toHaveBeenCalled();

    await weatherForecastGetRoute(mockRequest, mockResponse);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      results: {
        data: {
          departure: {
            description: 'mock-description',
            humidity: 'mock-humidity',
            icon: 'mock-icon',
            temperature: 'mock-temperature',
            windSpeed: 'mock-wind-speed',
          },
        },
      },
      success: true,
    });
  });
});
