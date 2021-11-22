import { getData, handleErrorAndReject } from './utils';
import { getGeoName } from './app-controller';

jest.mock('./utils');

describe('app-controller', () => {
  describe('getGeoName', () => {
    const mockGeoName = {
      adminCode1: 'ENG',
      lng: '-0.12574',
      geonameId: 2643743,
      toponymName: 'London',
      countryId: '2635167',
      fcl: 'P',
      population: 7556900,
      countryCode: 'GB',
      name: 'London',
      fclName: 'city, village,...',
      adminCodes1: { ISO3166_2: 'ENG' },
      countryName: 'United Kingdom',
      fcodeName: 'capital of a political entity',
      adminName1: 'England',
      lat: '51.50853',
      fcode: 'PPLC',
    };

    it('should correctly call getData', async () => {
      getData.mockResolvedValueOnce({
        success: true,
        results: {
          geonames: [mockGeoName],
        },
      });
      expect(getData).not.toHaveBeenCalled();
      await getGeoName('mock-location');
      expect(getData).toHaveBeenCalledTimes(1);
      expect(getData).toHaveBeenCalledWith('/api/geoname', { location: 'mock-location' });
    });

    it('should resolve correctly parsing the data received from getData', async () => {
      getData.mockResolvedValueOnce({
        success: true,
        results: {
          geonames: [mockGeoName],
        },
      });
      const result = await getGeoName('mock-location');
      expect(result).toStrictEqual(mockGeoName);
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
});
