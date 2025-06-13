jest.mock('./api-routes', () => {
  const { Router } = jest.requireActual('express');
  const router = Router();
  router.route('/mock-get-route').get((req, res) => {
    res.send({ john: 'cena' });
  });
  return router;
});

const request = require('supertest');
const net = require('net');

function isPortInUse(port) {
  return new Promise((resolve) => {
    const netServer = net.createServer();

    netServer.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      }
    });

    netServer.once('listening', () => {
      netServer.close();
      resolve(false);
    });

    netServer.listen(port);
  });
}

describe('server', () => {
  const MOCK_POST_ROUTE = '/post-mock-route';

  let app;
  let server;
  let expressStaticSpy;

  const closeServer = () =>
    new Promise((resolve) => {
      if (server) {
        server.close(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });

  function requireServer() {
    const express = require('express'); // eslint-disable-line global-require
    const mockExpressStatic = express.static('__mocks__/public');
    expressStaticSpy = jest.spyOn(express, 'static').mockReturnValue(mockExpressStatic);
    const serverModule = require('./index'); // eslint-disable-line global-require
    app = serverModule.app;
    server = serverModule.server;
  }

  beforeEach(() => {
    process.env.PORT = 3333;
    jest.resetModules();
  });

  afterEach(async () => {
    await closeServer();
    app = undefined;
    server = undefined;
  });

  it('should implement CORS', async () => {
    requireServer();
    const response = await request(app).get('/');
    expect(response.headers['access-control-allow-origin']).toEqual('*');
  });

  it('should parse json', async () => {
    requireServer();
    app.post(MOCK_POST_ROUTE, (req, res) => res.send(req.body));

    const response = await request(app).post(MOCK_POST_ROUTE).send({ name: 'john' });

    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(response.body).toStrictEqual({ name: 'john' });
  });

  it('should parse urlencoded strings with the querystring library', async () => {
    requireServer();
    app.post(MOCK_POST_ROUTE, (req, res) => res.send(req.body));

    const response = await request(app).post(MOCK_POST_ROUTE).send('foo[bar][baz]=foobarbaz');

    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(response.body).toStrictEqual({ 'foo[bar][baz]': 'foobarbaz' });
  });

  it('should initialise the main project folder', async () => {
    requireServer();
    expect(expressStaticSpy).toHaveBeenCalledTimes(1);
    expect(expressStaticSpy).toHaveBeenCalledWith('dist');
  });

  describe('ports', () => {
    it('should use process.env.PORT if set', async () => {
      requireServer();
      const result = await isPortInUse(process.env.PORT);
      expect(result).toBe(true);
    });

    it('should default to port 8080 if process.env.PORT if not set', async () => {
      delete process.env.PORT;
      requireServer();
      const result = await isPortInUse(8080);
      expect(result).toBe(true);
    });
  });

  describe('routes', () => {
    it('should return status 404 when an undefined route is requested', async () => {
      requireServer();
      const response = await request(app).get('/undefined-mock-route');
      expect(response.status).toBe(404);
    });

    it('should return the content of the index.html in the main project folder when the the GET `/` route is requested', async () => {
      requireServer();
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('text/html; charset=utf-8');
      expect(response.text).toMatchSnapshot();
    });

    it('should have a route /api using the sub-routes returned by the api-routes module', async () => {
      requireServer();
      const response = await request(app).get('/api/mock-get-route');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
      expect(response.body).toStrictEqual({ john: 'cena' });
    });
  });
});
