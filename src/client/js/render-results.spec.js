import { renderResultsView } from './render-results';

describe('renderResultsView', () => {
  const resultsViewParams = {
    capital: 'mock-capital',
    county: 'mock-county',
    continent: 'mock-continent',
    country: 'mock-country',
    city: 'mock-city',
    currencies: [
      { name: 'mock-currency1', code: 'cur1' },
      { name: 'mock-currency2', code: 'cur2' },
    ],
    languages: ['mock-language1', 'mock-language2'],
    timezone: 'mock-timezone',
    offset: 'mock-offset',
    flag: 'mock-flag',
    subregion: 'mock-subregion',
    thumbnail: 'mock-thumbnail',
    currentWeather: {
      apparentTemperature: 'mock-apparent-temperature',
      timezone: 'Australia/Sydney',
      dateString: '2021-12-06 23:12',
      description: 'mock-description',
      humidity: 'mock-humidity',
      icon: 'a01d',
      temperature: 'mock-temperature',
      windSpeed: 'mock-wind-speed',
    },
  };

  it.each`
    thumbnail
    ${'mock-thumbnail'}
    ${undefined}
  `('should correctly render the view, when a thumnail is $thumbnail', ({ thumbnail }) => {
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
  `('should correctly render the view, when a county is $county', ({ county }) => {
    const resultsView = renderResultsView({
      ...resultsViewParams,
      county,
    });
    expect(resultsView).toMatchSnapshot();
  });
});
