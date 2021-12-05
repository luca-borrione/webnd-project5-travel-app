import { getData, handleErrorAndReject } from './utils';
import { getGeoName, getPositionInfo, getDestinationImage } from './app-controller';

jest.mock('./utils');

describe('app-controller', () => {
  describe('getDestinationImage', () => {
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
      await getDestinationImage({ destination: 'mock-destination', country: 'mock-country' });
      expect(getData).toHaveBeenCalledTimes(1);
      expect(getData).toHaveBeenCalledWith('/api/destination-image', {
        destination: 'mock-destination',
        country: 'mock-country',
      });
    });

    it('should correctly parse the data received from getData when successfull', async () => {
      const result = await getDestinationImage({
        destination: 'mock-destination',
        country: 'mock-country',
      });
      expect(result).toBe('mock-thumbnail-url');
    });

    it('should return undefined when no images have been found', async () => {
      getData.mockResolvedValue({
        success: true,
        results: { hits: [] },
      });
      const result = await getDestinationImage({
        destination: 'mock-destination',
        country: 'mock-country',
      });
      expect(result).toBeUndefined();
    });

    it('should handle an error nicely', async () => {
      const expectedError = new Error('mock-expected-error');
      getData.mockRejectedValueOnce(expectedError);
      expect(handleErrorAndReject).not.toHaveBeenCalled();
      await getDestinationImage({
        destination: 'mock-destination',
        country: 'mock-country',
      });
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });

    it('should reject returning the error message when getData is not successfull', async () => {
      getData.mockResolvedValueOnce({ success: false, message: 'something went wrong' });
      const expectedError = new Error('something went wrong');
      expect(handleErrorAndReject).not.toHaveBeenCalled();
      await getDestinationImage({
        destination: 'mock-destination',
        country: 'mock-country',
      });
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });
  });

  describe('getGeoName', () => {
    const mockGeoName = {
      adminName1: 'mock-county',
      lng: 'mock-longitude',
      lat: 'mock-latitude',
      name: 'mock-destination',
      countryName: 'mock-country',
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
        county: 'mock-county',
        destination: 'mock-destination',
        latitude: 'mock-latitude',
        longitude: 'mock-longitude',
        country: 'mock-country',
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

  describe('getPositionInfo', () => {
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
      await getPositionInfo({ latitude: 'mock-latitude', longitude: 'mock-longitude' });
      expect(getData).toHaveBeenCalledTimes(1);
      expect(getData).toHaveBeenCalledWith('/api/position-info', {
        latitude: 'mock-latitude',
        longitude: 'mock-longitude',
      });
    });

    it('should correctly parse the data received from getData when successfull', async () => {
      const result = await getPositionInfo({
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
      await getPositionInfo({
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
      await getPositionInfo({
        latitude: 'mock-latitude',
        longitude: 'mock-longitude',
      });
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });
  });
});
