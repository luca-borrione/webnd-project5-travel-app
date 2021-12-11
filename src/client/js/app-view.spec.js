import { getGeoName, getPositionInfo, getThumbnail, getCurrentWeather } from './app-controller';
import './app-view';

jest.mock('./../assets/placeholder-destination-thumb.jpg', () => 'mock-placeholder-image');

jest.mock('./app-controller', () => ({
  getGeoName: jest.fn().mockResolvedValue({
    county: 'mock-county',
    city: 'mock-city',
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
  getThumbnail: jest.fn().mockResolvedValue('mock-image-url'),
  getCurrentWeather: jest.fn().mockResolvedValue({
    apparentTemperature: 'mock-apparent-temperature',
    dateString: 'mock-date-string',
    description: 'mock-description',
    humidity: 'mock-humidity',
    icon: 'mock-icon',
    temperature: 'mock-temperature',
    timezone: 'mock-timezone',
    windSpeed: 'mock-wind-speed',
  }),
}));

jest.mock('./render-results', () => ({
  renderResultsView: jest.fn().mockReturnValue('<main class="card">mock-results-view</main>'),
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

    $results = document.querySelector('.results');
  };

  beforeEach(() => {
    window.document.body.innerHTML = `
    <form name="search">
      <input id="search-form__destination" type="text" />
      <input id="search-form__departure" type="text" />
      <input id="search-form__departure-date" type="date" />
      <input id="search-form__return-date" type="date" />
    </form>
    <section class="results"></section>
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

    it('should correctly call getThumbnail', async () => {
      expect(getThumbnail).not.toHaveBeenCalled();
      $form.search.submit();
      await flushPromises();
      expect(getThumbnail).toHaveBeenCalledTimes(1);
      expect(getThumbnail).toHaveBeenCalledWith({
        country: 'mock-country',
        city: 'mock-city',
      });
    });

    it('should correctly call getCurrentWeather', async () => {
      expect(getCurrentWeather).not.toHaveBeenCalled();
      $form.search.submit();
      await flushPromises();
      expect(getCurrentWeather).toHaveBeenCalledTimes(1);
      expect(getCurrentWeather).toHaveBeenCalledWith({
        country: 'mock-country',
        city: 'mock-city',
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

    it('should handle an error nicely, if getThumbnail rejects', async () => {
      const expectedError = new Error('mock-expected-error');
      getThumbnail.mockRejectedValueOnce(expectedError);
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      $form.search.submit();
      await flushPromises();
      expect(errorSpy).toBeCalledTimes(1);
      expect(errorSpy).toBeCalledWith(expectedError);
    });

    it('should handle an error nicely, if getCurrentWeather rejects', async () => {
      const expectedError = new Error('mock-expected-error');
      getCurrentWeather.mockRejectedValueOnce(expectedError);
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      $form.search.submit();
      await flushPromises();
      expect(errorSpy).toBeCalledTimes(1);
      expect(errorSpy).toBeCalledWith(expectedError);
    });

    it('should update the results', async () => {
      expect($results).toMatchSnapshot();
      $form.search.submit();
      await flushPromises();
      expect($results).toMatchSnapshot();
    });
  });
});
