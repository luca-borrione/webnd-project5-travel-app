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
import { scrollElementIntoView } from './utils/browser-utils';
import { getDaysFromToday } from './utils/date-utils';
import { handleError } from './utils/error-utils';
import { renderResultsView, renderSavedTripsView } from './render-view';
import { removeTrip } from './app-view';

jest.mock('./../assets/placeholder-destination-thumb.jpg', () => 'mock-placeholder-image');

jest.mock('./utils/date-utils', () => ({
  getDaysFromToday: jest.fn().mockReturnValue(1),
}));

jest.mock('./utils/error-utils');

jest.mock('./utils/browser-utils');

jest.mock('./app-controller', () => ({
  getGeoName: jest.fn().mockResolvedValue({
    county: 'mock-county',
    city: 'mock-city',
    latitude: 'mock-latitude',
    longitude: 'mock-longitude',
    country: 'mock-country',
    geonameId: 1234,
  }),
  getLocationInfo: jest.fn().mockResolvedValue({
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
    dateString: 'mock-date-string',
    description: 'mock-description',
    humidity: 'mock-humidity',
    icon: 'mock-icon',
    temperature: 'mock-temperature',
    timezone: 'mock-timezone',
    windSpeed: 'mock-wind-speed',
  }),
  getWeatherForecast: jest.fn().mockResolvedValue({
    departure: {
      description: 'mock-description',
      humidity: 'mock-humidity',
      icon: 'mock-icon',
      windSpeed: 'mock-wind-speed',
    },
    return: {
      description: 'mock-description',
      humidity: 'mock-humidity',
      icon: 'mock-icon',
      windSpeed: 'mock-wind-speed',
    },
  }),
  postSaveTrip: jest.fn().mockResolvedValue([{ saved: 'trip1' }, { saved: 'trip2' }]),
  postRemoveTrip: jest.fn().mockResolvedValue([{ saved: 'trip2' }]),
  postRestoreTrips: jest.fn().mockResolvedValue([]),
}));

jest.mock('./render-view', () => ({
  renderResultsView: jest.fn().mockReturnValue(`
    <main class="card">
      mock-results-view
      <button class="card__button" type="button"></button>
    </main>
  `),
  renderSavedTripsView: jest.fn().mockReturnValue(`
    <main class="card">
      mock-saved-trips-view
    </main>
  `),
}));

const localStorageProto = Object.getPrototypeOf(window.localStorage);
jest.spyOn(localStorageProto, 'getItem').mockReturnValue('[{ "retrievedFrom": "storage" }]');
jest.spyOn(localStorageProto, 'setItem').mockImplementation();

// eslint-disable-next-line no-promise-executor-return
const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

describe('app-view', () => {
  const SAVED_TRIPS_KEY = 'savedTrips';

  let $form;
  let $main;
  let $results;
  let $savedTrips;
  let $spinner;

  const storeElements = () => {
    $form = {
      search: document.forms.search,
      destination: document.forms.search.elements['search-form__destination'],
      departure: document.forms.search.elements['search-form__departure'],
      departureDate: document.forms.search.elements['search-form__departure-date'],
      returnDate: document.forms.search.elements['search-form__return-date'],
      button: document.querySelector('.search-form__submit-button'),
    };

    $main = document.querySelector('main');
    $results = document.querySelector('.results');
    $savedTrips = document.querySelector('.saved-trips');
    $spinner = document.querySelector('.spinner');
  };

  beforeEach(() => {
    window.document.body.innerHTML = `
      <form name="search">
        <input id="search-form__destination" type="text" />
        <input id="search-form__departure" type="text" />
        <input id="search-form__departure-date" type="date" />
        <input id="search-form__return-date" type="date" />
        <button type="submit" class="search-form__submit-button" />
      </form>
      <aside class="spinner" />
      <main class="main-area hide">
        <section class="results" />
        <section class="saved-trips" />
      </main>
    `;

    storeElements();
  });

  describe('launching the app', () => {
    it('should hide the main area of the app and showing a spinner, while restoring the saved trips', async () => {
      expect($main.classList.contains('hide')).toBe(true);
      expect($spinner.classList.contains('hide')).toBe(false);
      window.document.dispatchEvent(
        new Event('DOMContentLoaded', {
          bubbles: true,
          cancelable: true,
        })
      );
      await flushPromises();
      expect($main.classList.contains('hide')).toBe(false);
      expect($spinner.classList.contains('hide')).toBe(true);
    });

    it('should try to retrieve the saved trips from the local storage', async () => {
      expect(window.localStorage.getItem).not.toHaveBeenCalled();
      window.document.dispatchEvent(
        new Event('DOMContentLoaded', {
          bubbles: true,
          cancelable: true,
        })
      );
      await flushPromises();
      expect(window.localStorage.getItem).toHaveBeenCalledTimes(1);
      expect(window.localStorage.getItem).toHaveBeenCalledWith(SAVED_TRIPS_KEY);
    });

    it('should correctly call postRestoreTrips', async () => {
      expect(postRestoreTrips).not.toHaveBeenCalled();
      window.document.dispatchEvent(
        new Event('DOMContentLoaded', {
          bubbles: true,
          cancelable: true,
        })
      );
      await flushPromises();
      expect(postRestoreTrips).toHaveBeenCalledTimes(1);
      expect(postRestoreTrips).toHaveBeenCalledWith({
        localStorageTrips: [{ retrievedFrom: 'storage' }],
      });
    });

    it('should save to the local storage the restored and updated trips received from the server', async () => {
      postRestoreTrips.mockResolvedValueOnce([{ restoredFrom: 'server' }]);
      expect(window.localStorage.setItem).not.toHaveBeenCalled();
      window.document.dispatchEvent(
        new Event('DOMContentLoaded', {
          bubbles: true,
          cancelable: true,
        })
      );
      await flushPromises();
      expect(window.localStorage.setItem).toHaveBeenCalledTimes(1);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        SAVED_TRIPS_KEY,
        '[{"restoredFrom":"server"}]'
      );
    });

    it('should correctly call renderSavedTripsView', async () => {
      postRestoreTrips.mockResolvedValueOnce([{ restoredFrom: 'server' }]);
      expect(renderSavedTripsView).not.toHaveBeenCalled();
      window.document.dispatchEvent(
        new Event('DOMContentLoaded', {
          bubbles: true,
          cancelable: true,
        })
      );
      await flushPromises();
      expect(renderSavedTripsView).toHaveBeenCalledTimes(1);
      expect(renderSavedTripsView).toHaveBeenCalledWith([{ restoredFrom: 'server' }]);
    });

    it('should correctly update the saved trips view', async () => {
      expect($savedTrips).toMatchSnapshot();
      window.document.dispatchEvent(
        new Event('DOMContentLoaded', {
          bubbles: true,
          cancelable: true,
        })
      );
      await flushPromises();
      expect($savedTrips).toMatchSnapshot();
    });

    it('should handle an error nicely, if postRestoreTrips rejects', async () => {
      const expectedError = new Error('mock-expected-error');
      postRestoreTrips.mockRejectedValueOnce(expectedError);
      expect(handleError).not.toHaveBeenCalled();
      window.document.dispatchEvent(
        new Event('DOMContentLoaded', {
          bubbles: true,
          cancelable: true,
        })
      );
      await flushPromises();
      expect(handleError).toHaveBeenCalledTimes(1);
      expect(handleError).toHaveBeenCalledWith(expectedError);
    });
  });

  describe('after having launched the app', () => {
    beforeEach(async () => {
      window.document.dispatchEvent(
        new Event('DOMContentLoaded', {
          bubbles: true,
          cancelable: true,
        })
      );

      await flushPromises();
      jest.clearAllMocks();
      $savedTrips.innerHTML = '';

      $form.destination.value = 'mock-destination';
      $form.departure.value = 'mock-departure';
      $form.departureDate.value = '2021-11-10';
      $form.returnDate.value = '2021-11-17';
    });

    describe('submitting a new search', () => {
      it('should put the form submit button into a loading state', () => {
        expect($form.button.classList.contains('loading')).toBe(false);
        expect($form.button.disabled).toBe(false);
        $form.search.submit();
        expect($form.button.classList.contains('loading')).toBe(true);
        expect($form.button.disabled).toBe(true);
      });

      it('should correctly call getGeoName', () => {
        expect(getGeoName).not.toHaveBeenCalled();
        $form.search.submit();
        expect(getGeoName).toHaveBeenCalledTimes(1);
        expect(getGeoName).toHaveBeenCalledWith({ location: 'mock-destination' });
      });

      it('should correctly call getLocationInfo', async () => {
        expect(getLocationInfo).not.toHaveBeenCalled();
        $form.search.submit();
        await flushPromises();
        expect(getLocationInfo).toHaveBeenCalledTimes(1);
        expect(getLocationInfo).toHaveBeenCalledWith({
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
          latitude: 'mock-latitude',
          longitude: 'mock-longitude',
        });
      });

      it('should correctly call getWeatherForecast when the departure date is within 16 days from today', async () => {
        expect(getWeatherForecast).not.toHaveBeenCalled();
        $form.search.submit();
        await flushPromises();
        expect(getWeatherForecast).toHaveBeenCalledTimes(1);
        expect(getWeatherForecast).toHaveBeenCalledWith({
          latitude: 'mock-latitude',
          longitude: 'mock-longitude',
          departureDate: '2021-11-10',
          returnDate: '2021-11-17',
        });
      });

      it('should not call getWeatherForecast when the departure date is at least 16 days from today', async () => {
        getDaysFromToday.mockReturnValueOnce(16);
        expect(getWeatherForecast).not.toHaveBeenCalled();
        $form.search.submit();
        await flushPromises();
        expect(getWeatherForecast).not.toHaveBeenCalled();
      });
    });

    describe('receiving the data of the search', () => {
      it.each`
        fnName                  | fn
        ${'getGeoName'}         | ${getGeoName}
        ${'getLocationInfo'}    | ${getLocationInfo}
        ${'getThumbnail'}       | ${getThumbnail}
        ${'getCurrentWeather'}  | ${getCurrentWeather}
        ${'getWeatherForecast'} | ${getWeatherForecast}
      `('should handle an error nicely, if $fnName rejects', async ({ fn }) => {
        const expectedError = new Error('mock-expected-error');
        fn.mockRejectedValueOnce(expectedError);
        expect(handleError).not.toHaveBeenCalled();
        $form.search.submit();
        await flushPromises();
        expect(handleError).toHaveBeenCalledTimes(1);
        expect(handleError).toHaveBeenCalledWith(expectedError);
      });

      it('should correctly call renderResultsView', async () => {
        expect(renderResultsView).not.toHaveBeenCalled();
        $form.search.submit();
        await flushPromises();
        expect(renderResultsView).toHaveBeenCalledTimes(1);
        expect(renderResultsView.mock.calls[0][0]).toMatchSnapshot();
      });

      it('should correctly update the results view', async () => {
        expect($results).toMatchSnapshot();
        $form.search.submit();
        await flushPromises();
        expect($results).toMatchSnapshot();
      });

      it('should restore the form submit button to its initial state', async () => {
        expect($form.button.classList.contains('loading')).toBe(false);
        expect($form.button.disabled).toBe(false);
        $form.search.submit();
        expect($form.button.classList.contains('loading')).toBe(true);
        expect($form.button.disabled).toBe(true);
        await flushPromises();
        expect($form.button.classList.contains('loading')).toBe(false);
        expect($form.button.disabled).toBe(false);
      });

      it('schould try to scroll the results into view', async () => {
        expect(scrollElementIntoView).not.toHaveBeenCalled();
        $form.search.submit();
        await flushPromises();
        expect(scrollElementIntoView).toHaveBeenCalledTimes(1);
        expect(scrollElementIntoView).toHaveBeenCalledWith($results);
      });
    });

    describe('clicking on the save trip button of the search results', () => {
      let $saveTripButton;

      beforeEach(async () => {
        $form.search.submit();
        await flushPromises();
        $saveTripButton = $results.querySelector('.card__button');
      });

      it('should correctly call postSaveTrip', async () => {
        expect(postSaveTrip).not.toHaveBeenCalled();
        $saveTripButton.click();
        await flushPromises();
        expect(postSaveTrip).toHaveBeenCalledTimes(1);
        expect(postSaveTrip.mock.calls[0][0]).toMatchSnapshot();
      });

      it('should store in the local storage the trips saved on the server', async () => {
        expect(window.localStorage.setItem).not.toHaveBeenCalled();
        $saveTripButton.click();
        await flushPromises();
        expect(window.localStorage.setItem).toHaveBeenCalledTimes(1);
        expect(window.localStorage.setItem).toHaveBeenCalledWith(
          SAVED_TRIPS_KEY,
          '[{"saved":"trip1"},{"saved":"trip2"}]'
        );
      });

      it('should correctly call renderSavedTripsView', async () => {
        expect(renderSavedTripsView).not.toHaveBeenCalled();
        $saveTripButton.click();
        await flushPromises();
        expect(renderSavedTripsView).toHaveBeenCalledTimes(1);
        expect(renderSavedTripsView).toHaveBeenCalledWith([{ saved: 'trip1' }, { saved: 'trip2' }]);
      });

      it('should correctly update the saved trips view', async () => {
        expect($savedTrips).toMatchSnapshot();
        $saveTripButton.click();
        await flushPromises();
        expect($savedTrips).toMatchSnapshot();
      });

      it('should handle an error nicely, if postSaveTrip rejects', async () => {
        const expectedError = new Error('mock-expected-error');
        postSaveTrip.mockRejectedValueOnce(expectedError);
        expect(handleError).not.toHaveBeenCalled();
        $saveTripButton.click();
        await flushPromises();
        expect(handleError).toHaveBeenCalledTimes(1);
        expect(handleError).toHaveBeenCalledWith(expectedError);
      });
    });

    describe('calling removeTrip', () => {
      it('should correcly call postRemoveTrip', async () => {
        expect(postRemoveTrip).not.toHaveBeenCalled();
        removeTrip('mock-trip-id');
        await flushPromises();
        expect(postRemoveTrip).toHaveBeenCalledTimes(1);
        expect(postRemoveTrip).toHaveBeenCalledWith({ tripId: 'mock-trip-id' });
      });

      it('should store in the local storage the remaining trips saved on the server', async () => {
        expect(window.localStorage.setItem).not.toHaveBeenCalled();
        removeTrip('mock-trip-id');
        await flushPromises();
        expect(window.localStorage.setItem).toHaveBeenCalledTimes(1);
        expect(window.localStorage.setItem).toHaveBeenCalledWith(
          SAVED_TRIPS_KEY,
          '[{"saved":"trip2"}]'
        );
      });

      it('should correctly call renderSavedTripsView', async () => {
        expect(renderSavedTripsView).not.toHaveBeenCalled();
        removeTrip('mock-trip-id');
        await flushPromises();
        expect(renderSavedTripsView).toHaveBeenCalledTimes(1);
        expect(renderSavedTripsView).toHaveBeenCalledWith([{ saved: 'trip2' }]);
      });

      it('should correctly update the saved trips view', async () => {
        expect($savedTrips).toMatchSnapshot();
        removeTrip('mock-trip-id');
        await flushPromises();
        expect($savedTrips).toMatchSnapshot();
      });

      it('should handle an error nicely, if postRemoveTrip rejects', async () => {
        const expectedError = new Error('mock-expected-error');
        postRemoveTrip.mockRejectedValueOnce(expectedError);
        expect(handleError).not.toHaveBeenCalled();
        removeTrip('mock-trip-id');
        await flushPromises();
        expect(handleError).toHaveBeenCalledTimes(1);
        expect(handleError).toHaveBeenCalledWith(expectedError);
      });
    });
  });
});
