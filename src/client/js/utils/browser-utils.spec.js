const { scrollElementIntoView } = require('./browser-utils');

describe('browser-utils', () => {
  describe('scrollElementIntoView', () => {
    let windowScrollTo;

    beforeEach(() => {
      windowScrollTo = window.scrollTo;
      window.scrollTo = jest.fn();
    });

    afterEach(() => {
      window.scrollTo = windowScrollTo;
    });

    describe('when element scrollIntoView is supported', () => {
      it('should scroll with smooth behavior, if supported', () => {
        const mockElement = {
          scrollIntoView: jest.fn(),
        };

        expect(mockElement.scrollIntoView).not.toHaveBeenCalled();

        const isScrolled = scrollElementIntoView(mockElement);

        expect(mockElement.scrollIntoView).toHaveBeenCalledTimes(1);
        expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
        expect(isScrolled).toBe(true);
      });

      it('should scroll without smooth behavior, if not supported', () => {
        const mockElement = {
          scrollIntoView: jest.fn().mockImplementationOnce(() => {
            throw new Error('not supported');
          }),
        };

        expect(mockElement.scrollIntoView).not.toHaveBeenCalled();

        const isScrolled = scrollElementIntoView(mockElement);

        expect(mockElement.scrollIntoView).toHaveBeenCalledTimes(2);
        expect(mockElement.scrollIntoView).toHaveBeenNthCalledWith(1, { behavior: 'smooth' });
        expect(mockElement.scrollIntoView).toHaveBeenNthCalledWith(2, true);
        expect(isScrolled).toBe(true);
      });
    });

    describe('when element scrollIntoView is not supported, but window scrollTo is', () => {
      it('should scroll with smooth behavior, if supported', () => {
        const mockElement = {
          offsetTop: 100,
        };

        expect(window.scrollTo).not.toHaveBeenCalled();

        const isScrolled = scrollElementIntoView(mockElement);

        expect(window.scrollTo).toHaveBeenCalledTimes(1);
        expect(window.scrollTo).toHaveBeenCalledWith({ behavior: 'smooth', top: 100 });
        expect(isScrolled).toBe(true);
      });

      it('should scroll without smooth behavior, if not supported', () => {
        window.scrollTo.mockImplementationOnce(() => {
          throw new Error('not supported');
        });

        const mockElement = {
          offsetTop: 100,
        };

        expect(window.scrollTo).not.toHaveBeenCalled();

        const isScrolled = scrollElementIntoView(mockElement);

        expect(window.scrollTo).toHaveBeenCalledTimes(2);
        expect(window.scrollTo).toHaveBeenNthCalledWith(2, { top: 100 });
        expect(isScrolled).toBe(true);
      });
    });

    describe('when both element scrollIntoView and window scrollTo are not supported', () => {
      it('should not scroll', () => {
        const mockElement = {
          offsetTop: 100,
          scrollIntoView: jest.fn().mockImplementation(() => {
            throw new Error('not supported');
          }),
        };

        window.scrollTo.mockImplementation(() => {
          throw new Error('not supported');
        });

        expect(mockElement.scrollIntoView).not.toHaveBeenCalled();
        expect(window.scrollTo).not.toHaveBeenCalled();

        const isScrolled = scrollElementIntoView(mockElement);

        expect(mockElement.scrollIntoView).toHaveBeenCalledTimes(2);
        expect(window.scrollTo).toHaveBeenCalledTimes(2);
        expect(isScrolled).toBe(false);
      });
    });
  });
});
