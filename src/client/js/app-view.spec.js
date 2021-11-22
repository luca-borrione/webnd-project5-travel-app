import { getGeoName } from './app-controller';
import './app-view';

jest.mock('./app-controller', () => ({
  getGeoName: jest.fn().mockResolvedValue({
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
  }),
}));

// eslint-disable-next-line no-promise-executor-return
const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

describe('app-view', () => {
  let $form;

  const storeElements = () => {
    $form = {
      search: document.forms.search,
      destination: document.forms.search.elements['search-form__destination'],
      departure: document.forms.search.elements['search-form__departure'],
      departureDate: document.forms.search.elements['search-form__departure-date'],
      returnDate: document.forms.search.elements['search-form__return-date'],
    };
  };

  beforeEach(() => {
    window.document.body.innerHTML = `
    <form name="search">
      <input id="search-form__destination" type="text" />
      <input id="search-form__departure" type="text" />
      <input id="search-form__departure-date" type="date" />
      <input id="search-form__return-date" type="date" />
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

    it('should call getGeoName', () => {
      expect(getGeoName).not.toHaveBeenCalled();
      $form.search.submit();
      expect(getGeoName).toHaveBeenCalledTimes(1);
      expect(getGeoName).toHaveBeenCalledWith('mock-destination');
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
  });
});
