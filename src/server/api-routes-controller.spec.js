jest.mock('node-fetch');

describe('api-routes-controller', () => {
  let controller;

  const postSaveTrip = (trip) => {
    const mockRequest = { body: { trip } };
    const mockResponse = { json: jest.fn() };
    controller.postSaveTrip(mockRequest, mockResponse);
    return mockResponse;
  };

  const getSavedTrips = () => {
    const mockRequest = {};
    const mockResponse = { json: jest.fn() };
    controller.getSavedTrips(mockRequest, mockResponse);
    return mockResponse;
  };

  const postRemoveTrip = (tripId) => {
    const mockRequest = { body: { tripId } };
    const mockResponse = { json: jest.fn() };
    controller.postRemoveTrip(mockRequest, mockResponse);
    return mockResponse;
  };

  const postSaveTrips = (trips) => {
    const mockRequest = { body: { trips } };
    const mockResponse = { json: jest.fn() };
    controller.postSaveTrips(mockRequest, mockResponse);
    return mockResponse;
  };

  beforeEach(() => {
    jest.resetModules();
    controller = require('./api-routes-controller'); // eslint-disable-line global-require
  });

  describe('getThumbnail', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    let mockFetch;

    beforeEach(() => {
      process.env.PIXABAY_APIKEY = 'MOCK-PIXABAY-APIKEY';
      mockFetch = require('node-fetch'); // eslint-disable-line global-require
      mockRequest = {
        query: { city: 'mock-city', country: 'mock-country' },
      };
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      mockNext = jest.fn();
    });

    it('should call fetch with the expected protocol hostname and pathname', async () => {
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getThumbnail(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const { protocol, hostname, pathname } = new URL(mockFetch.mock.calls[0][0]);
      expect(`${protocol}//${hostname}${pathname}`).toBe('https://pixabay.com/api');
    });

    it('should call fetch sending the required params in the query', async () => {
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getThumbnail(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const parsedUrl = new URL(mockFetch.mock.calls[0][0]);
      const queryParams = Object.fromEntries(new URLSearchParams(parsedUrl.search));
      const requiredParams = {
        category: 'travel',
        image_type: 'photo',
        key: 'MOCK-PIXABAY-APIKEY',
        // order: 'popular',
        orientation: 'horizontal',
        q: `mock-city mock-country`,
        safesearch: 'true',
      };
      expect(queryParams).toStrictEqual(requiredParams);
    });

    it('should call fetch sending undefined key if not set in the env', async () => {
      delete process.env.PIXABAY_APIKEY;
      jest.mock('dotenv', () => ({
        config: jest.fn().mockImplementationOnce(() => {}),
      }));
      jest.resetModules();
      controller = require('./api-routes-controller'); // eslint-disable-line global-require
      mockFetch = require('node-fetch'); // eslint-disable-line global-require
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getThumbnail(mockRequest, mockResponse, mockNext);
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
      await controller.getThumbnail(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toBeCalledWith(MOCK_FETCH_STATUS);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'mock-failure-message',
        success: false,
      });
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith('mock-failure-message');
    });

    it('should be successful and send the results data when the remote api responds with an ok status', async () => {
      mockFetch.mockReturnValueOnce({
        status: 200,
        json: jest.fn().mockReturnValueOnce({ data: 'mock-results-data' }),
      });
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getThumbnail(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: { data: 'mock-results-data' },
        success: true,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should be unsuccessful and send the error message when an error occurs', async () => {
      mockFetch.mockReturnValueOnce({
        status: 200,
        json: jest.fn().mockImplementationOnce(() => {
          throw new Error('mock-error-message');
        }),
      });
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getThumbnail(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toBeCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'mock-error-message',
        success: false,
      });
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(new Error('mock-error-message'));
    });
  });

  describe('getGeoName', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    let mockFetch;

    beforeEach(() => {
      process.env.GEONAMES_USERNAME = 'MOCK-GEONAMES-USERNAME';
      mockFetch = require('node-fetch'); // eslint-disable-line global-require
      mockRequest = {
        query: { location: 'mock-location' },
      };
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      mockNext = jest.fn();
    });

    it('should call fetch with the expected protocol hostname and pathname', async () => {
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getGeoName(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const { protocol, hostname, pathname } = new URL(mockFetch.mock.calls[0][0]);
      expect(`${protocol}//${hostname}${pathname}`).toBe('http://api.geonames.org/searchJSON');
    });

    it('should call fetch sending the required params in the query', async () => {
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getGeoName(mockRequest, mockResponse, mockNext);
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
      controller = require('./api-routes-controller'); // eslint-disable-line global-require
      mockFetch = require('node-fetch'); // eslint-disable-line global-require
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getGeoName(mockRequest, mockResponse, mockNext);
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
      await controller.getGeoName(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toBeCalledWith(MOCK_FETCH_STATUS);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'mock-failure-message',
        success: false,
      });
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith('mock-failure-message');
    });

    it('should be successful and send the results data when the remote api responds with an ok status', async () => {
      mockFetch.mockReturnValueOnce({
        status: 200,
        json: jest.fn().mockReturnValueOnce({ data: 'mock-results-data' }),
      });
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getGeoName(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: { data: 'mock-results-data' },
        success: true,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should be unsuccessful and send the error message when an error occurs', async () => {
      mockFetch.mockReturnValueOnce({
        status: 200,
        json: jest.fn().mockImplementationOnce(() => {
          throw new Error('mock-error-message');
        }),
      });
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getGeoName(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toBeCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'mock-error-message',
        success: false,
      });
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(new Error('mock-error-message'));
    });
  });

  describe('getLocationInfo', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    let mockFetch;

    beforeEach(() => {
      process.env.POSITIONSTACK_APIKEY = 'MOCK-POSITIONSTACK-APIKEY';
      mockFetch = require('node-fetch'); // eslint-disable-line global-require
      mockRequest = {
        query: { latitude: 10, longitude: -10 },
      };
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      mockNext = jest.fn();
    });

    it('should call fetch with the expected protocol hostname and pathname', async () => {
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getLocationInfo(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const { protocol, hostname, pathname } = new URL(mockFetch.mock.calls[0][0]);
      expect(`${protocol}//${hostname}${pathname}`).toBe('http://api.positionstack.com/v1/reverse');
    });

    it('should call fetch sending the required params in the query', async () => {
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getLocationInfo(mockRequest, mockResponse, mockNext);
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

    it('should call fetch sending undefined access_key if not set in the env', async () => {
      delete process.env.POSITIONSTACK_APIKEY;
      jest.mock('dotenv', () => ({
        config: jest.fn().mockImplementationOnce(() => {}),
      }));
      jest.resetModules();
      controller = require('./api-routes-controller'); // eslint-disable-line global-require
      mockFetch = require('node-fetch'); // eslint-disable-line global-require
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getLocationInfo(mockRequest, mockResponse, mockNext);
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
      await controller.getLocationInfo(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toBeCalledWith(MOCK_FETCH_STATUS);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'mock-failure-message',
        success: false,
      });
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith('mock-failure-message');
    });

    it('should be successful and send the results data when the remote api responds with an ok status', async () => {
      mockFetch.mockReturnValueOnce({
        status: 200,
        json: jest.fn().mockReturnValueOnce({ data: 'mock-results-data' }),
      });
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getLocationInfo(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: { data: 'mock-results-data' },
        success: true,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should be unsuccessful and send the error message when an error occurs', async () => {
      mockFetch.mockReturnValueOnce({
        status: 200,
        json: jest.fn().mockImplementationOnce(() => {
          throw new Error('mock-error-message');
        }),
      });
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getLocationInfo(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toBeCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'mock-error-message',
        success: false,
      });
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(new Error('mock-error-message'));
    });
  });

  describe('getCurrentWeather', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    let mockFetch;

    beforeEach(() => {
      process.env.WEATHERBIT_APIKEY = 'MOCK-WEATHERBIT-APIKEY';
      mockFetch = require('node-fetch'); // eslint-disable-line global-require
      mockRequest = {
        query: { latitude: 'mock-latitude', longitude: 'mock-longitude' },
      };
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      mockNext = jest.fn();
    });

    it('should call fetch with the expected protocol hostname and pathname', async () => {
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getCurrentWeather(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const { protocol, hostname, pathname } = new URL(mockFetch.mock.calls[0][0]);
      expect(`${protocol}//${hostname}${pathname}`).toBe('http://api.weatherbit.io/v2.0/current');
    });

    it('should call fetch sending the required params in the query', async () => {
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getCurrentWeather(mockRequest, mockResponse, mockNext);
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

    it('should call fetch sending undefined key if not set in the env', async () => {
      delete process.env.WEATHERBIT_APIKEY;
      jest.mock('dotenv', () => ({
        config: jest.fn().mockImplementationOnce(() => {}),
      }));
      jest.resetModules();
      controller = require('./api-routes-controller'); // eslint-disable-line global-require
      mockFetch = require('node-fetch'); // eslint-disable-line global-require
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getCurrentWeather(mockRequest, mockResponse, mockNext);
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
      await controller.getCurrentWeather(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toBeCalledWith(MOCK_FETCH_STATUS);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'mock-failure-message',
        success: false,
      });
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith('mock-failure-message');
    });

    it('should be successful and send the results data when the remote api responds with an ok status', async () => {
      mockFetch.mockReturnValueOnce({
        status: 200,
        json: jest.fn().mockReturnValueOnce({ data: 'mock-results-data' }),
      });
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getCurrentWeather(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: { data: 'mock-results-data' },
        success: true,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should be unsuccessful and send the error message when an error occurs', async () => {
      mockFetch.mockReturnValueOnce({
        status: 200,
        json: jest.fn().mockImplementationOnce(() => {
          throw new Error('mock-error-message');
        }),
      });
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getCurrentWeather(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toBeCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'mock-error-message',
        success: false,
      });
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(new Error('mock-error-message'));
    });
  });

  describe('getWeatherForecast', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    let mockFetch;

    beforeEach(() => {
      process.env.WEATHERBIT_APIKEY = 'MOCK-WEATHERBIT-APIKEY';
      mockFetch = require('node-fetch'); // eslint-disable-line global-require
      mockRequest = {
        query: { latitude: 'mock-latitude', longitude: 'mock-longitude' },
      };
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      mockNext = jest.fn();
    });

    it('should call fetch with the expected protocol hostname and pathname', async () => {
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getWeatherForecast(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const { protocol, hostname, pathname } = new URL(mockFetch.mock.calls[0][0]);
      expect(`${protocol}//${hostname}${pathname}`).toBe(
        'http://api.weatherbit.io/v2.0/forecast/daily'
      );
    });

    it('should call fetch sending the required params in the query', async () => {
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getWeatherForecast(mockRequest, mockResponse, mockNext);
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

    it('should call fetch sending undefined key if not set in the env', async () => {
      delete process.env.WEATHERBIT_APIKEY;
      jest.mock('dotenv', () => ({
        config: jest.fn().mockImplementationOnce(() => {}),
      }));
      jest.resetModules();
      controller = require('./api-routes-controller'); // eslint-disable-line global-require
      mockFetch = require('node-fetch'); // eslint-disable-line global-require
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getWeatherForecast(mockRequest, mockResponse, mockNext);
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
      await controller.getWeatherForecast(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toBeCalledWith(MOCK_FETCH_STATUS);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'mock-failure-message',
        success: false,
      });
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith('mock-failure-message');
    });

    it('should be successful and send the results data when the remote api responds with an ok status', async () => {
      mockFetch.mockReturnValueOnce({
        status: 200,
        json: jest.fn().mockReturnValueOnce({ data: 'mock-results-data' }),
      });
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getWeatherForecast(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: { data: 'mock-results-data' },
        success: true,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should be unsuccessful and send the error message when an error occurs', async () => {
      mockFetch.mockReturnValueOnce({
        status: 200,
        json: jest.fn().mockImplementationOnce(() => {
          throw new Error('mock-error-message');
        }),
      });
      expect(mockFetch).not.toHaveBeenCalled();
      await controller.getWeatherForecast(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toBeCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'mock-error-message',
        success: false,
      });
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(new Error('mock-error-message'));
    });
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

  describe('postSaveTrip', () => {
    it('should always respond with a success flag and the array of saved trips', () => {
      const mockResponse = postSaveTrip({ id: 1 });
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        results: { data: [{ id: 1 }] },
      });
    });

    it('should store all the posted trips', () => {
      postSaveTrip({ id: 1 });
      postSaveTrip({ id: 2 });

      const mockResponse = getSavedTrips();
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: { data: [{ id: 1 }, { id: 2 }] },
        success: true,
      });
    });

    it('should remove the previously stored entry if one with the same id is sent again', () => {
      postSaveTrip({ id: 1 });
      postSaveTrip({ id: 2 });
      postSaveTrip({ id: 1 });

      const mockResponse = getSavedTrips();
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: { data: [{ id: 2 }, { id: 1 }] },
        success: true,
      });
    });
  });

  describe('getSavedTrips', () => {
    it('should retrieve an empty array if no trips have been saved', () => {
      const mockResponse = getSavedTrips();
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: { data: [] },
        success: true,
      });
    });

    it('should retrieve all the stored trips if any have been posted', () => {
      const mockRequest = {};
      const mockResponse = { json: jest.fn() };

      postSaveTrip({ id: 1 });
      controller.getSavedTrips(mockRequest, mockResponse);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: { data: [{ id: 1 }] },
        success: true,
      });

      postSaveTrip({ id: 2 });
      controller.getSavedTrips(mockRequest, mockResponse);
      expect(mockResponse.json).toHaveBeenCalledTimes(2);
      expect(mockResponse.json).toHaveBeenNthCalledWith(2, {
        results: { data: [{ id: 1 }, { id: 2 }] },
        success: true,
      });
    });
  });

  describe('postRemoveTrip', () => {
    it('should respond with success flag and the array of the remaining saved trips, if it succeeded in removing a trip', () => {
      postSaveTrip({ id: 1 });
      postSaveTrip({ id: 2 });

      const mockResponse = postRemoveTrip(1);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        results: { data: [{ id: 2 }] },
      });
    });

    it('should respond with success flag and the array of the remaining saved trips, if the id passed is not corresponding to any saved trip', () => {
      postSaveTrip({ id: 1 });
      postSaveTrip({ id: 2 });

      const mockResponse = postRemoveTrip(3);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        results: { data: [{ id: 1 }, { id: 2 }] },
      });
    });

    it('should respond with success flag and the array of the remaining saved trips, if there was no saved trips', () => {
      const mockResponse = postRemoveTrip(3);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        results: { data: [] },
      });
    });
  });

  describe('postSaveTrips', () => {
    it('should replace the stored saved trips with the given ones', () => {
      const mockRequest = {};
      const mockResponse = { json: jest.fn() };

      controller.getSavedTrips(mockRequest, mockResponse);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: { data: [] },
        success: true,
      });

      postSaveTrips([{ id: 1 }]);

      controller.getSavedTrips(mockRequest, mockResponse);
      expect(mockResponse.json).toHaveBeenCalledTimes(2);
      expect(mockResponse.json).toHaveBeenNthCalledWith(2, {
        results: { data: [{ id: 1 }] },
        success: true,
      });
    });

    it('should respond with success flag and the replaced array of the saved trips', () => {
      const mockResponse = postSaveTrips([{ id: 1 }]);

      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: { data: [{ id: 1 }] },
        success: true,
      });
    });
  });
});
