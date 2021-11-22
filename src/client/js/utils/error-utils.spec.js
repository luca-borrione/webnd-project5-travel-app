import { handleError, handleErrorAndReject } from './error-utils';

describe('error-utils', () => {
  let errorSpy;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  describe('handleError', () => {
    it('should log the error in the console', () => {
      const expectedError = new Error('mock-expected-error');
      handleError(expectedError);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(expectedError);
    });

    it('should log an error in the console every time it is invoked', () => {
      const expectedError1 = new Error('mock-expected-error1');
      const expectedError2 = new Error('mock-expected-error2');
      const expectedError3 = new Error('mock-expected-error3');

      handleError(expectedError1);
      handleError(expectedError2);
      handleError(expectedError3);

      expect(errorSpy).toHaveBeenCalledTimes(3);
      expect(errorSpy).toHaveBeenNthCalledWith(1, expectedError1);
      expect(errorSpy).toHaveBeenNthCalledWith(2, expectedError2);
      expect(errorSpy).toHaveBeenNthCalledWith(3, expectedError3);
    });

    it('should not log an error in the console if the same has been already logged once', () => {
      const expectedError1 = new Error('mock-expected-error1');
      const expectedError2 = new Error('mock-expected-error2');

      handleError(expectedError1);
      handleError(expectedError2);
      handleError(expectedError1);

      expect(errorSpy).toHaveBeenCalledTimes(2);
      expect(errorSpy).toHaveBeenNthCalledWith(1, expectedError1);
      expect(errorSpy).toHaveBeenNthCalledWith(2, expectedError2);
    });
  });

  describe('handleErrorAndReject', () => {
    it('should log an error in the console and return a Promise rejection', () => {
      expect.assertions(3);
      const expectedError = new Error('mock-expected-error');
      handleErrorAndReject(expectedError).catch((error) => {
        expect(error).toBe(expectedError);
      });
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(expectedError);
    });
  });
});
