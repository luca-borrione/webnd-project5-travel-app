jest.mock('node-fetch');

describe('thumbnail', () => {
  const mockQuery = { city: 'mock-city', country: 'mock-country' };

  let mockFetch;

  beforeEach(() => {
    mockFetch = require('node-fetch'); // eslint-disable-line global-require

    process.env.PIXABAY_APIKEY = 'MOCK-PIXABAY-APIKEY';
  });

  describe('thumbnailGetRoute', () => {
    let thumbnailGetRoute;
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
      thumbnailGetRoute = require('./thumbnail').thumbnailGetRoute; // eslint-disable-line global-require

      mockRequest = { query: mockQuery };

      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it('should call fetch with the expected protocol hostname and pathname', async () => {
      expect(mockFetch).not.toHaveBeenCalled();
      await thumbnailGetRoute(mockRequest, mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const { protocol, hostname, pathname } = new URL(mockFetch.mock.calls[0][0]);
      expect(`${protocol}//${hostname}${pathname}`).toBe('https://pixabay.com/api');
    });

    it('should call fetch sending the required params in the query', async () => {
      expect(mockFetch).not.toHaveBeenCalled();
      await thumbnailGetRoute(mockRequest, mockResponse);
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
      thumbnailGetRoute = require('./thumbnail').thumbnailGetRoute; // eslint-disable-line global-require
      mockFetch = require('node-fetch'); // eslint-disable-line global-require
      expect(mockFetch).not.toHaveBeenCalled();
      await thumbnailGetRoute(mockRequest, mockResponse);
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
      await thumbnailGetRoute(mockRequest, mockResponse);
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
      await thumbnailGetRoute(mockRequest, mockResponse);
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
        json: jest.fn().mockReturnValueOnce({ hits: [{ webformatURL: 'mock-thumbnail-url' }] }),
      });
      expect(mockFetch).not.toHaveBeenCalled();
      await thumbnailGetRoute(mockRequest, mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: { data: 'mock-thumbnail-url' },
        success: true,
      });
    });
  });

  describe('getThumbnail', () => {
    let getThumbnail;

    beforeEach(() => {
      getThumbnail = require('./thumbnail').getThumbnail; // eslint-disable-line global-require
    });

    it('should be successful and correctly transform the results data when the remote api responds with an ok status', async () => {
      mockFetch.mockReturnValueOnce({
        status: 200,
        json: jest.fn().mockReturnValueOnce({ hits: [{ webformatURL: 'mock-thumbnail-url' }] }),
      });
      expect(mockFetch).not.toHaveBeenCalled();

      const response = await getThumbnail(mockQuery);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(response).toBe('mock-thumbnail-url');
    });

    it('should throw an unhandled error when something goes wrong', () => {
      expect.assertions(1);
      const mockError = new Error('mock-error-message');
      mockFetch.mockImplementationOnce(() => {
        throw mockError;
      });

      getThumbnail(mockQuery).catch((error) => {
        expect(error).toBe(mockError);
      });
    });
  });
});
