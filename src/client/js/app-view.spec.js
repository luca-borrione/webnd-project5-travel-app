import { getGeoName, getPositionInfo, getDestinationImage } from './app-controller';
import { selectors } from './utils';
import './app-view';

jest.mock('./../assets/placeholder-destination-thumb.jpg', () => 'mock-placeholder-image');

jest.mock('./app-controller', () => ({
  getDestinationImage: jest.fn().mockResolvedValue('mock-image-url'),
  getGeoName: jest.fn().mockResolvedValue({
    county: 'mock-county',
    destination: 'mock-destination',
    latitude: 'mock-latitude',
    longitude: 'mock-longitude',
    country: 'mock-country',
  }),
  getPositionInfo: jest.fn().mockResolvedValue({
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
  }),
}));

// eslint-disable-next-line no-promise-executor-return
const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

describe('app-view', () => {
  let $form;
  let $results;

  const storeElements = () => {
    $form = {
      search: document.forms.search,
      destination: document.forms.search.elements['search-form__destination'],
      departure: document.forms.search.elements['search-form__departure'],
      departureDate: document.forms.search.elements['search-form__departure-date'],
      returnDate: document.forms.search.elements['search-form__return-date'],
    };

    $results = {
      card: document.querySelector(selectors.results.card),
      county: document.querySelector(selectors.results.county),
      thumbnail: document.querySelector(selectors.results.thumbnail),
    };
  };

  beforeEach(() => {
    window.document.body.innerHTML = `
    <form name="search">
      <input id="search-form__destination" type="text" />
      <input id="search-form__departure" type="text" />
      <input id="search-form__departure-date" type="date" />
      <input id="search-form__return-date" type="date" />
    </form>
    <article class="results-card">
      <img class="results-card__image-thumbnail" src="" />
      <span class="results-card__image-caption-flag"></span>
      <span class="results-card__image-caption-destination"></span>
      <div class="results-card__info-continent--value"></div>
      <div class="results-card__info-subregion--value"></div>
      <div class="results-card__info-country--value"></div>
      <div class="results-card__info-county--value"></div>
      <div class="results-card__info-capital--value"></div>
      <div class="results-card__info-currency--value"></div>
      <div class="results-card__info-language--value"></div>
      <div class="results-card__info-timezone-name--value"></div>
      <div class="results-card__info-timezone-offset--value"></div>
    </article>
    `;

    window.document.dispatchEvent(
      new Event('DOMContentLoaded', {
        bubbles: true,
        cancelable: true,
      })
    );

    storeElements();
  });

  describe('submitting a new search', () => {
    beforeEach(() => {
      $form.destination.value = 'mock-destination';
      $form.departure.value = 'mock-deparure';
      $form.departureDate.value = '10/11/2021';
      $form.returnDate.value = '17/11/2021';
    });

    it('should correctly call getGeoName', () => {
      expect(getGeoName).not.toHaveBeenCalled();
      $form.search.submit();
      expect(getGeoName).toHaveBeenCalledTimes(1);
      expect(getGeoName).toHaveBeenCalledWith('mock-destination');
    });

    it('should correctly call getPositionInfo', async () => {
      expect(getPositionInfo).not.toHaveBeenCalled();
      $form.search.submit();
      await flushPromises();
      expect(getPositionInfo).toHaveBeenCalledTimes(1);
      expect(getPositionInfo).toHaveBeenCalledWith({
        latitude: 'mock-latitude',
        longitude: 'mock-longitude',
      });
    });

    it('should correctly call getPositionInfo', async () => {
      expect(getDestinationImage).not.toHaveBeenCalled();
      $form.search.submit();
      await flushPromises();
      expect(getDestinationImage).toHaveBeenCalledTimes(1);
      expect(getDestinationImage).toHaveBeenCalledWith({
        country: 'mock-country',
        destination: 'mock-destination',
      });
    });
  });

  describe('receiving the data of the search', () => {
    it('should handle an error nicely, if getGeoName rejects', async () => {
      const expectedError = new Error('mock-expected-error');
      getGeoName.mockRejectedValueOnce(expectedError);
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      $form.search.submit();
      await flushPromises();
      expect(errorSpy).toBeCalledTimes(1);
      expect(errorSpy).toBeCalledWith(expectedError);
    });

    it('should handle an error nicely, if getPositionInfo rejects', async () => {
      const expectedError = new Error('mock-expected-error');
      getPositionInfo.mockRejectedValueOnce(expectedError);
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      $form.search.submit();
      await flushPromises();
      expect(errorSpy).toBeCalledTimes(1);
      expect(errorSpy).toBeCalledWith(expectedError);
    });

    it('should handle an error nicely, if getDestinationImage rejects', async () => {
      const expectedError = new Error('mock-expected-error');
      getDestinationImage.mockRejectedValueOnce(expectedError);
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      $form.search.submit();
      await flushPromises();
      expect(errorSpy).toBeCalledTimes(1);
      expect(errorSpy).toBeCalledWith(expectedError);
    });

    it('should update the results', async () => {
      expect($results.card).toMatchSnapshot();
      $form.search.submit();
      await flushPromises();
      expect($results.card).toMatchSnapshot();
    });

    it('should default the county to n/a, if not available', async () => {
      getGeoName.mockResolvedValueOnce({
        county: undefined,
        destination: 'mock-destination',
        latitude: 'mock-latitude',
        longitude: 'mock-longitude',
        country: 'mock-country',
      });
      expect($results.county.innerHTML).toBe('');
      $form.search.submit();
      await flushPromises();
      expect($results.county.innerHTML).toBe('n/a');
    });

    it('should default the thumbnail to a placeholder, if not available', async () => {
      getDestinationImage.mockResolvedValueOnce(undefined);
      expect($results.thumbnail.src).toBe('http://localhost/');
      $form.search.submit();
      await flushPromises();
      expect($results.thumbnail.src).toBe('http://localhost/mock-placeholder-image');
    });
  });
});
