import { getDaysFromToday, formatTimestampToLocale, formatDateString } from './utils/date-utils';
import { renderResultsView, renderSavedTripsView } from './render-view';

jest.mock('./utils/date-utils', () => ({
  ...jest.requireActual('./utils/date-utils'),
  getDaysFromToday: jest.fn().mockReturnValue(1),
  getDaysDiff: jest.fn().mockReturnValue(1),
  formatTimestampToLocale: jest
    .fn()
    .mockImplementation(({ timestamp }) => `${timestamp}-formatted`),
  formatDateString: jest.fn().mockImplementation((date) => `${date}-formatted`),
}));

describe('renderResultsView', () => {
  const resultsViewParams = {
    thumbnail: 'mock-thumbnail-url',
    locationInfo: {
      capital: 'mock-capital',
      city: 'mock-city',
      continent: 'mock-continent',
      country: 'mock-country',
      county: 'mock-county',
      currencies: [
        {
          code: 'cur1',
          name: 'mock-currency1',
        },
        {
          code: 'cur2',
          name: 'mock-currency2',
        },
      ],
      flag: 'mock-flag',
      languages: ['mock-language1', 'mock-language2'],
      offset: 'mock-offset',
      subregion: 'mock-subregion',
      timezone: 'mock-timezone',
    },
    currentInfo: {
      timezone: 'mock-timezone',
      weather: {
        description: 'mock-current-description',
        humidity: '3.5',
        icon: 'a01d',
        observedTimestamp: 'mock-observed-timestamp',
        temperature: 'mock-current-temperature',
        windSpeed: '10.3',
      },
    },
    departureInfo: {
      dateString: 'mock-departure-date',
      weather: {
        description: 'mock-departure-description',
        humidity: '13.5',
        icon: 'a01d',
        temperature: 'mock-departure-temperature',
        windSpeed: '20.3',
      },
    },
    returnInfo: {
      dateString: 'mock-return-date',
      weather: {
        description: 'mock-return-description',
        humidity: '23.5',
        icon: 'a01d',
        temperature: 'mock-temperature',
        windSpeed: '30.3',
      },
    },
  };

  it.each`
    thumbnail
    ${'mock-thumbnail'}
    ${undefined}
  `('should correctly render the view, when the thumbnail is $thumbnail', ({ thumbnail }) => {
    const resultsView = renderResultsView({
      ...resultsViewParams,
      thumbnail,
    });
    expect(resultsView).toMatchSnapshot();
  });

  it.each`
    county
    ${'mock-county'}
    ${undefined}
  `('should correctly render the view, when the county is $county', ({ county }) => {
    const resultsView = renderResultsView({
      ...resultsViewParams,
      county,
    });
    expect(resultsView).toMatchSnapshot();
  });

  it('should correcly format the dates', () => {
    expect(formatTimestampToLocale).not.toHaveBeenCalled();
    expect(formatDateString).not.toHaveBeenCalled();

    renderResultsView(resultsViewParams);

    expect(formatTimestampToLocale).toHaveBeenCalledTimes(1);
    expect(formatTimestampToLocale).toHaveBeenCalledWith({
      timestamp: 'mock-observed-timestamp',
      timezone: 'mock-timezone',
    });

    expect(formatDateString).toHaveBeenCalledTimes(2);
    expect(formatDateString).toHaveBeenNthCalledWith(1, 'mock-departure-date');
    expect(formatDateString).toHaveBeenNthCalledWith(2, 'mock-return-date');
  });

  it('should correctly render the view, when the return weather forecast is undefined', () => {
    const resultsView = renderResultsView({
      ...resultsViewParams,
      returnInfo: {
        ...resultsViewParams.returnInfo,
        weather: undefined,
      },
    });
    expect(resultsView).toMatchSnapshot();
  });

  it('should correctly render the view, when both the departure and return weather forecasts are undefined', () => {
    const resultsView = renderResultsView({
      ...resultsViewParams,
      departureInfo: {
        ...resultsViewParams.departureInfo,
        weather: undefined,
      },
      returnInfo: {
        ...resultsViewParams.returnInfo,
        weather: undefined,
      },
    });
    expect(resultsView).toMatchSnapshot();
  });
});

describe('renderSavedTripsView', () => {
  const mockTrip = {
    id: 'mock-trip-id-1',
    thumbnail: 'mock-thumbnail-url',
    locationInfo: {
      city: 'mock-city',
      flag: 'mock-flag',
    },
    currentInfo: {
      timezone: 'Australia/Sydney',
      weather: {
        description: 'mock-description',
        humidity: '3.5',
        icon: 'a01d',
        observedTimestamp: 'mock-observed-timestamp',
        temperature: 'mock-temperature',
        windSpeed: '10.3',
      },
    },
    departureInfo: {
      dateString: 'mock-departure-date',
      weather: {
        description: 'mock-departure-description',
        humidity: '13.5',
        icon: 'a01d',
        temperature: 'mock-departure-temperature',
        windSpeed: '20.3',
      },
    },
    returnInfo: {
      dateString: 'mock-return-date',
      weather: {
        description: 'mock-return-description',
        humidity: '23.5',
        icon: 'a01d',
        temperature: 'mock-return-temperature',
        windSpeed: '30.3',
      },
    },
  };

  it('should correctly render the view, when the trip is expired', () => {
    getDaysFromToday.mockReturnValue(-1);
    const view = renderSavedTripsView([mockTrip]);
    expect(view).toMatchSnapshot();
  });

  it('should correctly render the view, when the trip is today', () => {
    getDaysFromToday.mockReturnValue(0);
    const view = renderSavedTripsView([mockTrip]);
    expect(view).toMatchSnapshot();
  });

  it('should correctly render the view, when the trip is tomorrow', () => {
    getDaysFromToday.mockReturnValue(1);
    const view = renderSavedTripsView([mockTrip]);
    expect(view).toMatchSnapshot();
  });

  it('should correctly render the view, when the trip is in future', () => {
    getDaysFromToday.mockReturnValue(2);
    const view = renderSavedTripsView([mockTrip]);
    expect(view).toMatchSnapshot();
  });

  it.each`
    thumbnail
    ${'mock-thumbnail'}
    ${undefined}
  `('should correctly render the view, when the thumbnail is $thumbnail', ({ thumbnail }) => {
    const view = renderSavedTripsView([{ ...mockTrip, thumbnail }]);
    expect(view).toMatchSnapshot();
  });

  it('should correctly render the view, when the return weather forecast is undefined', () => {
    const view = renderSavedTripsView([
      {
        ...mockTrip,
        returnInfo: {
          ...mockTrip.returnInfo,
          weather: undefined,
        },
      },
    ]);
    expect(view).toMatchSnapshot();
  });

  it('should correctly render the view, when both the departure and return weather forecasts are undefined', () => {
    const view = renderSavedTripsView([
      {
        ...mockTrip,
        departureInfo: {
          ...mockTrip.departureInfo,
          weather: undefined,
        },
        returnInfo: {
          ...mockTrip.returnInfo,
          weather: undefined,
        },
      },
    ]);

    expect(view).toMatchSnapshot();
  });

  it('should correctly render the view, when there are multiple saved trips', () => {
    const view = renderSavedTripsView([
      mockTrip,
      {
        ...mockTrip,
        id: 'mock-trip-id-2',
      },
    ]);

    expect(view).toMatchSnapshot();
  });
});
