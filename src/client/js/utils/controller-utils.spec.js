import { postData, getData } from './controller-utils';
import { handleErrorAndReject } from './error-utils';

jest.mock('./error-utils');

describe('controller-utils', () => {
  let fetchSpy;
  let fetchInGlobal = true;

  beforeAll(() => {
    if (!('fetch' in global)) {
      fetchInGlobal = false;
      global.fetch = jest.fn();
    }

    fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      json: jest.fn().mockReturnValue({ mock: 'response' }),
    });
  });

  afterAll(() => {
    if (!fetchInGlobal) {
      delete global.fetch;
    }
  });

  describe('postData', () => {
    it('should correctly trigger a POST fetch call', async () => {
      await postData('mock/api', { mock: 'data' });
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith('mock/api', {
        body: '{"mock":"data"}',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
    });

    it('should return any response retrieved from the fetch call in a json format', async () => {
      const response = await postData('mock/api', { mock: 'data' });
      expect(response).toStrictEqual({ mock: 'response' });
    });

    it('should handle an error nicely', async () => {
      const expectedError = new Error('mock-expected-error');
      fetchSpy.mockRejectedValueOnce(expectedError);
      await postData('mock/api', { mock: 'data' });
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });
  });

  describe('getData', () => {
    it('should trigger a GET fetch call adding the query params if present', async () => {
      const queryParams = { mock: 'param', john: 'cena' };
      await getData('mock/api', queryParams);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith('mock/api?mock=param&john=cena');
    });

    it('should trigger a GET fetch call with only the base url if no query params are passed', async () => {
      await getData('mock/api');
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith('mock/api');
    });

    it('should return any response retrieved from the fetch call in a json format', async () => {
      const response = await getData('mock/api');
      expect(response).toStrictEqual({ mock: 'response' });
    });

    it('should handle an error nicely', async () => {
      const expectedError = new Error('mock-expected-error');
      fetchSpy.mockRejectedValueOnce(expectedError);
      await getData('mock/api');
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });
  });
});
