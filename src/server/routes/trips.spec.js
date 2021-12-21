jest.mock('../utils/error-utils');

jest.mock(
  'bent',
  () => () =>
    jest
      .fn()
      .mockImplementation((thumbnail) =>
        thumbnail === 'mock-expired-thumbnail' ? Promise.reject() : Promise.resolve()
      )
);

jest.mock('../utils/date-utils', () => ({
  getDaysFromToday: jest
    .fn()
    .mockImplementation((date) =>
      date === 'mock-expired-deparure-date' || date === 'mock-expired-departure-date' ? -1 : 1
    ),
}));

jest.mock('./thumbnail', () => ({
  getThumbnail: jest.fn().mockResolvedValue('mock-updated-thumbnail'),
}));

jest.mock('./weather-forecast', () => ({
  getWeatherForecast: jest.fn().mockImplementation(({ departureDate, returnDate }) => ({
    departureWeather:
      departureDate !== 'mock-expired-deparure-date' ? 'mock-departure-weather' : undefined,
    returnWeather: returnDate !== 'mock-expired-return-date' ? 'mock-return-weather' : undefined,
  })),
}));

// eslint-disable-next-line no-promise-executor-return
const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

describe('trips', () => {
  let addTripPostRoute;
  let removeTripPostRoute;
  let restoreTripsPostRoute;

  beforeEach(() => {
    jest.resetModules();
    addTripPostRoute = require('./trips').addTripPostRoute; // eslint-disable-line global-require
    removeTripPostRoute = require('./trips').removeTripPostRoute; // eslint-disable-line global-require
    restoreTripsPostRoute = require('./trips').restoreTripsPostRoute; // eslint-disable-line global-require
  });

  const addTrip = (trip) => {
    const mockRequest = { body: { trip } };
    const mockResponse = { json: jest.fn() };
    addTripPostRoute(mockRequest, mockResponse);
    return mockResponse;
  };

  const removeTrip = (tripId) => {
    const mockRequest = { body: { tripId } };
    const mockResponse = { json: jest.fn() };
    removeTripPostRoute(mockRequest, mockResponse);
    return mockResponse;
  };

  const restoreTrips = (localStorageTrips) => {
    const mockRequest = { body: { localStorageTrips } };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    restoreTripsPostRoute(mockRequest, mockResponse);
    return mockResponse;
  };

  describe('addTripPostRoute', () => {
    it('should always respond with a success flag and the array of saved trips', () => {
      const mockResponse = addTrip({ id: 1 });
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        results: { data: [{ id: 1 }] },
      });
    });

    it('should store all the posted trips', () => {
      addTrip({ id: 1 });
      const mockResponse = addTrip({ id: 2 });
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: { data: [{ id: 1 }, { id: 2 }] },
        success: true,
      });
    });

    it('should remove the previously stored entry if one with the same id is sent again', () => {
      addTrip({ id: 1 });
      addTrip({ id: 2 });
      const mockResponse = addTrip({ id: 1 });
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: { data: [{ id: 2 }, { id: 1 }] },
        success: true,
      });
    });
  });

  describe('removeTripPostRoute', () => {
    it('should respond with success flag and the array of the remaining saved trips, if it succeeded in removing a trip', () => {
      addTrip({ id: 1 });
      addTrip({ id: 2 });
      const mockResponse = removeTrip(1);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        results: { data: [{ id: 2 }] },
      });
    });

    it('should respond with success flag and the array of the remaining saved trips, if the id passed is not corresponding to any saved trip', () => {
      addTrip({ id: 1 });
      addTrip({ id: 2 });
      const mockResponse = removeTrip(3);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        results: { data: [{ id: 1 }, { id: 2 }] },
      });
    });

    it('should respond with success flag and an empty array as remaining saved trips, if there was no saved trips', () => {
      const mockResponse = removeTrip(3);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        results: { data: [] },
      });
    });
  });

  describe('restoreTripsPostRoute', () => {
    const mockTrip = {
      thumbnail: 'mock-thumbnail',
      locationInfo: {
        city: 'mock-city',
        country: 'mock-country',
      },
      departureInfo: {
        dateString: 'mock-departure-date',
      },
      returnInfo: {
        dateString: 'mock-return-date',
      },
    };

    it('should restore the trips saved in the local storage, if there are no trips saved on the server', async () => {
      const mockResponse = restoreTrips([
        {
          ...mockTrip,
          saved: 'on-local-storage',
        },
      ]);
      await flushPromises();
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: {
          data: [expect.objectContaining({ saved: 'on-local-storage' })],
        },
        success: true,
      });
      expect(mockResponse.json.mock.calls[0][0]).toMatchSnapshot();
    });

    it('should restore the trips saved on the server if present, regardless of the trips saved on the local storage', async () => {
      addTrip({
        ...mockTrip,
        saved: 'on-server',
      });
      const mockResponse = restoreTrips([
        {
          ...mockTrip,
          saved: 'on-local-storage',
        },
      ]);
      await flushPromises();
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: {
          data: [expect.objectContaining({ saved: 'on-server' })],
        },
        success: true,
      });
      expect(mockResponse.json.mock.calls[0][0]).toMatchSnapshot();
    });

    it('should default to an empty array if no trips are saved on the server or on the local storage', async () => {
      const mockResponse = restoreTrips();
      await flushPromises();
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: {
          data: [],
        },
        success: true,
      });
      expect(mockResponse.json.mock.calls[0][0]).toMatchSnapshot();
    });

    it('should update the thumbnail if the saved link expired', async () => {
      const mockResponse = restoreTrips([
        {
          ...mockTrip,
          thumbnail: 'mock-expired-thumbnail',
        },
      ]);
      await flushPromises();
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: {
          data: [expect.objectContaining({ thumbnail: 'mock-updated-thumbnail' })],
        },
        success: true,
      });
      expect(mockResponse.json.mock.calls[0][0]).toMatchSnapshot();
    });

    it('should update the thumbnail, if the thumbnail is undefined', async () => {
      const mockResponse = restoreTrips([
        {
          ...mockTrip,
          thumbnail: undefined,
        },
      ]);
      await flushPromises();
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: {
          data: [expect.objectContaining({ thumbnail: 'mock-updated-thumbnail' })],
        },
        success: true,
      });
      expect(mockResponse.json.mock.calls[0][0]).toMatchSnapshot();
    });

    it('should override the thumbnail with undefined if the saved link expired and the getThumbnail api rejects', async () => {
      jest.mock('./thumbnail', () => ({
        getThumbnail: jest.fn().mockRejectedValue(),
      }));
      jest.resetModules();
      restoreTripsPostRoute = require('./trips').restoreTripsPostRoute; // eslint-disable-line global-require

      const mockResponse = restoreTrips([
        {
          ...mockTrip,
          thumbnail: 'mock-expired-thumbnail',
        },
      ]);
      await flushPromises();
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: {
          data: [expect.objectContaining({ thumbnail: undefined })],
        },
        success: true,
      });
      expect(mockResponse.json.mock.calls[0][0]).toMatchSnapshot();
    });

    it('should add fresh weather forecasts, if both the departure date and the return date are not expired', async () => {
      const mockResponse = restoreTrips([mockTrip]);
      await flushPromises();
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: {
          data: [
            expect.objectContaining({
              departureInfo: {
                dateString: 'mock-departure-date',
                weather: 'mock-departure-weather',
              },
              returnInfo: {
                dateString: 'mock-return-date',
                weather: 'mock-return-weather',
              },
            }),
          ],
        },
        success: true,
      });
      expect(mockResponse.json.mock.calls[0][0]).toMatchSnapshot();
    });

    it('should add fresh weather forecast for the departure only, if the return date expired', async () => {
      const mockResponse = restoreTrips([
        {
          ...mockTrip,
          returnInfo: {
            ...mockTrip.returnInfo,
            dateString: 'mock-expired-return-date',
          },
        },
      ]);
      await flushPromises();
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: {
          data: [
            expect.objectContaining({
              departureInfo: {
                dateString: 'mock-departure-date',
                weather: 'mock-departure-weather',
              },
              returnInfo: {
                dateString: 'mock-expired-return-date',
                weather: undefined,
              },
            }),
          ],
        },
        success: true,
      });
      expect(mockResponse.json.mock.calls[0][0]).toMatchSnapshot();
    });

    it('should not add any weather forecast, if both the departure date and the return date expired', async () => {
      const mockResponse = restoreTrips([
        {
          ...mockTrip,
          departureInfo: {
            ...mockTrip.departureInfo,
            dateString: 'mock-expired-departure-date',
          },
          returnInfo: {
            ...mockTrip.returnInfo,
            dateString: 'mock-expired-return-date',
          },
        },
      ]);
      await flushPromises();
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: {
          data: [
            expect.objectContaining({
              departureInfo: {
                dateString: 'mock-expired-departure-date',
                weather: undefined,
              },
              returnInfo: {
                dateString: 'mock-expired-return-date',
                weather: undefined,
              },
            }),
          ],
        },
        success: true,
      });
      expect(mockResponse.json.mock.calls[0][0]).toMatchSnapshot();
    });

    it('should not add any weather forecast, if the getWeatherForecast api rejects', async () => {
      jest.mock('./weather-forecast', () => ({
        getWeatherForecast: jest.fn().mockRejectedValueOnce(),
      }));
      jest.resetModules();
      restoreTripsPostRoute = require('./trips').restoreTripsPostRoute; // eslint-disable-line global-require

      const mockResponse = restoreTrips([mockTrip]);
      await flushPromises();
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: {
          data: [
            expect.objectContaining({
              departureInfo: {
                dateString: 'mock-departure-date',
                weather: undefined,
              },
              returnInfo: {
                dateString: 'mock-return-date',
                weather: undefined,
              },
            }),
          ],
        },
        success: true,
      });
      expect(mockResponse.json.mock.calls[0][0]).toMatchSnapshot();
    });

    it('should be able to restore multiple trips', async () => {
      const mockResponse = restoreTrips([
        {
          ...mockTrip,
          id: 1,
        },
        {
          ...mockTrip,
          id: 2,
          returnInfo: {
            ...mockTrip.returnInfo,
            dateString: 'mock-expired-return-date',
          },
        },
        {
          ...mockTrip,
          id: 3,
          thumbnail: 'mock-expired-thumbnail',
        },
      ]);
      await flushPromises();
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json.mock.calls[0][0]).toMatchSnapshot();
    });

    it('should handle an error nicely', async () => {
      const { handleError } = require('../utils/error-utils'); // eslint-disable-line global-require
      const mockError = new Error('mock-error-message');

      const localStorageTrips = [mockTrip];
      const mockRequest = { body: { localStorageTrips } };
      const mockStatusJson = jest.fn();
      const mockResponse = {
        status: jest.fn().mockImplementation(() => ({
          json: mockStatusJson,
        })),
        json: jest.fn().mockImplementationOnce(() => {
          throw mockError;
        }),
      };
      restoreTripsPostRoute(mockRequest, mockResponse);

      await flushPromises();

      expect(handleError).toHaveBeenCalledTimes(1);
      expect(handleError).toHaveBeenCalledWith(mockError);
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toBeCalledWith(500);
      expect(mockStatusJson).toHaveBeenCalledTimes(1);
      expect(mockStatusJson).toHaveBeenCalledWith({
        message: 'mock-error-message',
        success: false,
      });
    });
  });
});
