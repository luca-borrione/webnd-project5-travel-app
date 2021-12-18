import { getData, postData } from './utils/controller-utils';
import { handleErrorAndReject } from './utils/error-utils';
import {
  getCurrentWeather,
  getGeoName,
  getLocationInfo,
  getThumbnailUrl,
  getWeatherForecast,
  postSaveTrip,
  postSaveTrips,
  postRemoveTrip,
  getSavedTrips,
} from './app-controller';

jest.mock('./utils/controller-utils');
jest.mock('./utils/error-utils');

describe('app-controller', () => {
  describe('getGeoName', () => {
    const mockGeoName = {
      adminName1: 'mock-county',
      countryName: 'mock-country',
      geonameId: 'mock-geoname-id',
      lat: 'mock-latitude',
      lng: 'mock-longitude',
      name: 'mock-city',
    };

    beforeEach(() => {
      getData.mockResolvedValue({
        success: true,
        results: {
          geonames: [mockGeoName],
        },
      });
    });

    it('should correctly call getData', async () => {
      expect(getData).not.toHaveBeenCalled();
      await getGeoName('mock-location');
      expect(getData).toHaveBeenCalledTimes(1);
      expect(getData).toHaveBeenCalledWith('/api/geoname', { location: 'mock-location' });
    });

    it('should correctly parse the data received from getData when successfull', async () => {
      const result = await getGeoName('mock-location');
      expect(result).toStrictEqual({
        city: 'mock-city',
        country: 'mock-country',
        county: 'mock-county',
        geonameId: 'mock-geoname-id',
        latitude: 'mock-latitude',
        longitude: 'mock-longitude',
      });
    });

    it('should handle an error nicely', async () => {
      const expectedError = new Error('mock-expected-error');
      getData.mockRejectedValueOnce(expectedError);
      expect(handleErrorAndReject).not.toHaveBeenCalled();
      await getGeoName('mock-location');
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });

    it('should reject returning the error message when getData is not successfull', async () => {
      getData.mockResolvedValueOnce({ success: false, message: 'something went wrong' });
      const expectedError = new Error('something went wrong');
      expect(handleErrorAndReject).not.toHaveBeenCalled();
      await getGeoName('mock-location');
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });
  });

  describe('getLocationInfo', () => {
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

    beforeEach(() => {
      getData.mockResolvedValue({
        success: true,
        results: {
          data: [mockPositionInfo],
        },
      });
    });

    it('should correctly call getData', async () => {
      expect(getData).not.toHaveBeenCalled();
      await getLocationInfo({ latitude: 'mock-latitude', longitude: 'mock-longitude' });
      expect(getData).toHaveBeenCalledTimes(1);
      expect(getData).toHaveBeenCalledWith('/api/position-info', {
        latitude: 'mock-latitude',
        longitude: 'mock-longitude',
      });
    });

    it('should correctly parse the data received from getData when successfull', async () => {
      const result = await getLocationInfo({
        latitude: 'mock-latitude',
        longitude: 'mock-longitude',
      });
      expect(result).toStrictEqual({
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
      });
    });

    it('should handle an error nicely', async () => {
      const expectedError = new Error('mock-expected-error');
      getData.mockRejectedValueOnce(expectedError);
      expect(handleErrorAndReject).not.toHaveBeenCalled();
      await getLocationInfo({
        latitude: 'mock-latitude',
        longitude: 'mock-longitude',
      });
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });

    it('should reject returning the error message when getData is not successfull', async () => {
      getData.mockResolvedValueOnce({ success: false, message: 'something went wrong' });
      const expectedError = new Error('something went wrong');
      expect(handleErrorAndReject).not.toHaveBeenCalled();
      await getLocationInfo({
        latitude: 'mock-latitude',
        longitude: 'mock-longitude',
      });
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });
  });

  describe('getThumbnailUrl', () => {
    const mockDestinationImage = {
      webformatURL: 'mock-thumbnail-url',
    };

    beforeEach(() => {
      getData.mockResolvedValue({
        success: true,
        results: {
          hits: [mockDestinationImage],
        },
      });
    });

    it('should correctly call getData', async () => {
      expect(getData).not.toHaveBeenCalled();
      await getThumbnailUrl({ city: 'mock-city', country: 'mock-country' });
      expect(getData).toHaveBeenCalledTimes(1);
      expect(getData).toHaveBeenCalledWith('/api/thumbnail', {
        city: 'mock-city',
        country: 'mock-country',
      });
    });

    it('should correctly parse the data received from getData when successfull', async () => {
      const result = await getThumbnailUrl({
        city: 'mock-city',
        country: 'mock-country',
      });
      expect(result).toBe('mock-thumbnail-url');
    });

    it('should return undefined when no images have been found', async () => {
      getData.mockResolvedValue({
        success: true,
        results: { hits: [] },
      });
      const result = await getThumbnailUrl({
        city: 'mock-city',
        country: 'mock-country',
      });
      expect(result).toBeUndefined();
    });

    it('should handle an error nicely', async () => {
      const expectedError = new Error('mock-expected-error');
      getData.mockRejectedValueOnce(expectedError);
      expect(handleErrorAndReject).not.toHaveBeenCalled();
      await getThumbnailUrl({
        city: 'mock-city',
        country: 'mock-country',
      });
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });

    it('should reject returning the error message when getData is not successfull', async () => {
      getData.mockResolvedValueOnce({ success: false, message: 'something went wrong' });
      const expectedError = new Error('something went wrong');
      expect(handleErrorAndReject).not.toHaveBeenCalled();
      await getThumbnailUrl({
        city: 'mock-city',
        country: 'mock-country',
      });
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });
  });

  describe('getCurrentWeather', () => {
    const mockCurrentWeatherResult = {
      app_temp: 'mock-apparent-temperature',
      ob_time: 'mock-date-string',
      rh: 'mock-humidity',
      temp: 'mock-temperature',
      timezone: 'mock-timezone',
      weather: {
        icon: 'mock-icon',
        description: 'mock-description',
      },
      wind_spd: 'mock-wind-speed',
    };

    beforeEach(() => {
      getData.mockResolvedValue({
        success: true,
        results: {
          data: [mockCurrentWeatherResult],
        },
      });
    });

    it('should correctly call getData', async () => {
      expect(getData).not.toHaveBeenCalled();
      await getCurrentWeather({
        latitude: 'mock-latitude',
        longitude: 'mock-longitude',
      });
      expect(getData).toHaveBeenCalledTimes(1);
      expect(getData).toHaveBeenCalledWith('/api/weather-current', {
        latitude: 'mock-latitude',
        longitude: 'mock-longitude',
      });
    });

    it('should correctly parse the data received from getData when successfull', async () => {
      const result = await getCurrentWeather({
        latitude: 'mock-latitude',
        longitude: 'mock-longitude',
      });
      expect(result).toStrictEqual({
        dateString: 'mock-date-string',
        description: 'mock-description',
        humidity: 'mock-humidity',
        icon: 'mock-icon',
        temperature: 'mock-temperature',
        windSpeed: 'mock-wind-speed',
      });
    });

    it('should handle an error nicely', async () => {
      const expectedError = new Error('mock-expected-error');
      getData.mockRejectedValueOnce(expectedError);
      expect(handleErrorAndReject).not.toHaveBeenCalled();
      await getCurrentWeather({
        latitude: 'mock-latitude',
        longitude: 'mock-longitude',
      });
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });

    it('should reject returning the error message when getData is not successfull', async () => {
      getData.mockResolvedValueOnce({ success: false, message: 'something went wrong' });
      const expectedError = new Error('something went wrong');
      expect(handleErrorAndReject).not.toHaveBeenCalled();
      await getCurrentWeather({
        latitude: 'mock-latitude',
        longitude: 'mock-longitude',
      });
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });
  });

  describe('getWeatherForecast', () => {
    const mockWeatherForecastResult = {
      rh: 'mock-humidity',
      temp: 'mock-temperature',
      weather: { icon: 'mock-icon', description: 'mock-description' },
      wind_spd: 'mock-wind-speed',
    };

    beforeEach(() => {
      getData.mockResolvedValue({
        success: true,
        results: {
          data: [
            { ...mockWeatherForecastResult, valid_date: 'mock-departure-date' },
            { ...mockWeatherForecastResult, valid_date: 'mock-return-date' },
          ],
        },
      });
    });

    it('should correctly call getData', async () => {
      expect(getData).not.toHaveBeenCalled();
      await getWeatherForecast({
        latitude: 'mock-latitude',
        longitude: 'mock-longitude',
        departureDateString: 'mock-departure-date',
        returnDateString: 'mock-return-date',
      });
      expect(getData).toHaveBeenCalledTimes(1);
      expect(getData).toHaveBeenCalledWith('/api/weather-forecast', {
        latitude: 'mock-latitude',
        longitude: 'mock-longitude',
      });
    });

    it('should correctly parse the data received from getData when successfull', async () => {
      const result = await getWeatherForecast({
        latitude: 'mock-latitude',
        longitude: 'mock-longitude',
        departureDateString: 'mock-departure-date',
        returnDateString: 'mock-return-date',
      });
      expect(result).toStrictEqual({
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
      });
    });

    it('should correctly parse the data received from getData when successfull but there is no weather forecast available for the return date', async () => {
      getData.mockResolvedValueOnce({
        success: true,
        results: {
          data: [{ ...mockWeatherForecastResult, valid_date: 'mock-departure-date' }],
        },
      });
      const result = await getWeatherForecast({
        latitude: 'mock-latitude',
        longitude: 'mock-longitude',
        departureDateString: 'mock-departure-date',
        returnDateString: 'mock-return-date',
      });
      expect(result).toStrictEqual({
        departure: {
          description: 'mock-description',
          humidity: 'mock-humidity',
          icon: 'mock-icon',
          temperature: 'mock-temperature',
          windSpeed: 'mock-wind-speed',
        },
        return: undefined,
      });
    });

    it('should handle an error nicely', async () => {
      const expectedError = new Error('mock-expected-error');
      getData.mockRejectedValueOnce(expectedError);
      expect(handleErrorAndReject).not.toHaveBeenCalled();
      await getWeatherForecast({
        latitude: 'mock-latitude',
        longitude: 'mock-longitude',
        departureDateString: 'mock-departure-date',
        returnDateString: 'mock-return-date',
      });
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });

    it('should reject returning the error message when getData is not successfull', async () => {
      getData.mockResolvedValueOnce({ success: false, message: 'something went wrong' });
      const expectedError = new Error('something went wrong');
      expect(handleErrorAndReject).not.toHaveBeenCalled();
      await getWeatherForecast({
        latitude: 'mock-latitude',
        longitude: 'mock-longitude',
        departureDateString: 'mock-departure-date',
        returnDateString: 'mock-return-date',
      });
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });
  });

  describe('postSaveTrip', () => {
    const mockSavedTrips = [{ id: 1 }];

    beforeEach(() => {
      postData.mockResolvedValue({
        success: true,
        results: {
          data: [mockSavedTrips],
        },
      });
    });

    it('should correctly call postData', async () => {
      await postSaveTrip({ id: 1 });
      expect(postData).toHaveBeenCalledTimes(1);
      expect(postData).toHaveBeenCalledWith('/api/save-trip', { trip: { id: 1 } });
    });

    it('should return the response received from postData', async () => {
      const response = await postSaveTrip({ id: 1 });
      expect(response).toStrictEqual({
        results: { data: [[{ id: 1 }]] },
        success: true,
      });
    });

    it('should handle an error nicely', async () => {
      const expectedError = new Error('mock-expected-error');
      postData.mockRejectedValueOnce(expectedError);
      await postSaveTrip({ id: 1 });
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });
  });

  describe('postSaveTrips', () => {
    const mockSavedTrips = [{ id: 1 }];

    beforeEach(() => {
      postData.mockResolvedValue({
        success: true,
        results: {
          data: [mockSavedTrips],
        },
      });
    });

    it('should correctly call postData', async () => {
      await postSaveTrips({ id: 1 });
      expect(postData).toHaveBeenCalledTimes(1);
      expect(postData).toHaveBeenCalledWith('/api/save-trips', { trips: { id: 1 } });
    });

    it('should return the response received from postData', async () => {
      const response = await postSaveTrips({ id: 1 });
      expect(response).toStrictEqual({
        results: { data: [[{ id: 1 }]] },
        success: true,
      });
    });

    it('should handle an error nicely', async () => {
      const expectedError = new Error('mock-expected-error');
      postData.mockRejectedValueOnce(expectedError);
      await postSaveTrips({ id: 1 });
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });
  });

  describe('postRemoveTrip', () => {
    const mockSavedTrips = [{ id: 1 }];

    beforeEach(() => {
      postData.mockResolvedValue({
        success: true,
        results: {
          data: [mockSavedTrips],
        },
      });
    });

    it('should correctly call postData', async () => {
      await postRemoveTrip({ id: 1 });
      expect(postData).toHaveBeenCalledTimes(1);
      expect(postData).toHaveBeenCalledWith('/api/remove-trip', { tripId: { id: 1 } });
    });

    it('should return the response received from postData', async () => {
      const response = await postRemoveTrip({ id: 1 });
      expect(response).toStrictEqual({
        results: { data: [[{ id: 1 }]] },
        success: true,
      });
    });

    it('should handle an error nicely', async () => {
      const expectedError = new Error('mock-expected-error');
      postData.mockRejectedValueOnce(expectedError);
      await postRemoveTrip({ id: 1 });
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });
  });

  describe('getSavedTrips', () => {
    beforeEach(() => {
      getData.mockResolvedValue({
        success: true,
        results: {
          data: [{ id: 1 }],
        },
      });
    });

    it('should correctly call getData', async () => {
      expect(getData).not.toHaveBeenCalled();
      await getSavedTrips();
      expect(getData).toHaveBeenCalledTimes(1);
      expect(getData).toHaveBeenCalledWith('/api/get-saved-trips');
    });

    it('should correctly parse the data received from getData when successfull', async () => {
      const result = await getSavedTrips();
      expect(result).toStrictEqual([{ id: 1 }]);
    });

    it('should handle an error nicely', async () => {
      const expectedError = new Error('mock-expected-error');
      getData.mockRejectedValueOnce(expectedError);
      expect(handleErrorAndReject).not.toHaveBeenCalled();
      await getSavedTrips();
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });

    it('should reject returning the error message when getData is not successfull', async () => {
      getData.mockResolvedValueOnce({ success: false, message: 'something went wrong' });
      const expectedError = new Error('something went wrong');
      expect(handleErrorAndReject).not.toHaveBeenCalled();
      await getSavedTrips();
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });
  });
});
