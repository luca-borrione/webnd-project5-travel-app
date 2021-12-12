import { renderResultsView } from './render-results';

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
      timezone: 'Australia/Sydney',
      dateString: '2021-12-06 23:12',
      weather: {
        description: 'mock-description',
        humidity: 'mock-humidity',
        icon: 'a01d',
        temperature: 'mock-temperature',
        windSpeed: 'mock-wind-speed',
      },
    },
    departureInfo: {
      dateString: '2021-12-11',
      weather: {
        description: 'mock-description',
        humidity: 'mock-humidiy',
        icon: 'a01d',
        windSpeed: 'mock-wind-speed',
      },
    },
    returnInfo: {
      dateString: '2021-12-12',
      weather: {
        description: 'mock-description',
        humidity: 'mock-humidiy',
        icon: 'a01d',
        windSpeed: 'mock-wind-speed',
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
