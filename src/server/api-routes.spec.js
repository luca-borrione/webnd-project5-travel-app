describe('api-routes', () => {
  let routeSpy;
  let routeGetSpy;
  let routePostSpy;

  function prepareRouteSpies(path) {
    const express = require('express'); // eslint-disable-line global-require

    routeGetSpy = jest.fn();
    routePostSpy = jest.fn();
    routeSpy = jest.fn().mockImplementation((routePath) => {
      if (routePath === path) {
        return {
          get: routeGetSpy,
          post: routePostSpy,
        };
      }
      return {
        get: jest.fn(),
        post: jest.fn(),
      };
    });
    jest.spyOn(express, 'Router').mockReturnValueOnce({
      route: routeSpy,
    });
    require('./api-routes'); // eslint-disable-line global-require
  }

  beforeEach(() => {
    jest.resetModules();
  });

  it('should match the routes stored in the snapshot', () => {
    prepareRouteSpies();
    expect(routeSpy.mock.calls).toMatchSnapshot();
  });
});
