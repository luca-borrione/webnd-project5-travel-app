import { getData, postData } from './utils/controller-utils';
import { handleErrorAndReject } from './utils/error-utils';
import {
  getCurrentWeather,
  getGeoName,
  getLocationInfo,
  getThumbnail,
  getWeatherForecast,
  postRemoveTrip,
  postSaveTrip,
  postRestoreTrips,
} from './app-controller';

jest.mock('./utils/controller-utils');
jest.mock('./utils/error-utils');

describe('app-controller', () => {
  const location = 'mock-location';
  const latitude = 'mock-latitude';
  const longitude = 'mock-longitude';
  const city = 'mock-city';
  const country = 'mock-country';
  const departureDate = 'mock-departure-date';
  const returnDate = 'mock-return-date';
  const trip = 'mock-trip';
  const tripId = 'mock-trip-id';
  const localStorageTrips = 'mock-local-storage-trips';

  describe.each`
    fnName                  | fn                    | requestData | params                                                | api
    ${'getGeoName'}         | ${getGeoName}         | ${getData}  | ${{ location }}                                       | ${'/api/geoname'}
    ${'getLocationInfo'}    | ${getLocationInfo}    | ${getData}  | ${{ latitude, longitude }}                            | ${'/api/location-info'}
    ${'getThumbnail'}       | ${getThumbnail}       | ${getData}  | ${{ city, country }}                                  | ${'/api/thumbnail'}
    ${'getCurrentWeather'}  | ${getCurrentWeather}  | ${getData}  | ${{ latitude, longitude }}                            | ${'/api/weather/current'}
    ${'getWeatherForecast'} | ${getWeatherForecast} | ${getData}  | ${{ latitude, longitude, departureDate, returnDate }} | ${'/api/weather/forecast'}
    ${'postRemoveTrip'}     | ${postRemoveTrip}     | ${postData} | ${{ tripId }}                                         | ${'/api/trips/remove'}
    ${'postSaveTrip'}       | ${postSaveTrip}       | ${postData} | ${{ trip }}                                           | ${'/api/trips/add'}
    ${'postRestoreTrips'}   | ${postRestoreTrips}   | ${postData} | ${{ localStorageTrips }}                              | ${'/api/trips/restore'}
  `('$fnName', ({ requestData, fn, params, api }) => {
    beforeEach(() => {
      requestData.mockResolvedValue({
        success: true,
        results: {
          data: 'mock-results-data',
        },
      });
    });

    it('should correctly call requestData', async () => {
      expect(requestData).not.toHaveBeenCalled();
      await fn(params);
      expect(requestData).toHaveBeenCalledTimes(1);
      expect(requestData).toHaveBeenCalledWith(api, params);
    });

    it('should correctly parse the data received from getData when successfull', async () => {
      const result = await fn(params);
      expect(result).toStrictEqual('mock-results-data');
    });

    it('should handle an error nicely', async () => {
      const expectedError = new Error('mock-expected-error');
      requestData.mockRejectedValueOnce(expectedError);
      expect(handleErrorAndReject).not.toHaveBeenCalled();
      await fn(params);
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });

    it('should reject returning the error message when getData is not successfull', async () => {
      requestData.mockResolvedValueOnce({ success: false, message: 'something went wrong' });
      const expectedError = new Error('something went wrong');
      expect(handleErrorAndReject).not.toHaveBeenCalled();
      await fn(params);
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });
  });
});
