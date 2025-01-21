const request = require('supertest');
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

// Supabase-Client mocken
jest.mock('@supabase/supabase-js', () => {
  const mockClient = {
    from: jest.fn(() => ({
      select: jest.fn(),
      update: jest.fn(),
      eq: jest.fn(),
      in: jest.fn(),
      single: jest.fn(),
    })),
  };
  return {
    createClient: jest.fn(() => mockClient),
  };
});

// Route importieren (relativer Pfad)
const routerSeatReservations = require('../../../cineo_backend/src/controller/filmeController');
const routerFilme = require('../../../cineo_backend/src/controller/filmeController');

// Mock-Datenbankinitialisierung
const supabase = createClient();


let app;
beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  app = express();
  app.use(express.json());
  app.use('/api/filme', routerFilme);
});


describe('GET /filme/:movieId', () => {
    it('should return a movie when it exists', async () => {
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() =>
            Promise.resolve({
              data: [
                { movie_id: '1', title: 'Test Movie', image: 'test.jpg', duration: 120 },
              ],
              error: null,
            })
          ),
        })),
      }));

      const res = await request(app).get('/api/filme/1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ movie_id: '1', title: 'Test Movie', image: 'test.jpg', duration: 120 });
    });

    it('should return 404 if the movie is not found', async () => {
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() =>
            Promise.resolve({
              data: [],
              error: null,
            })
          ),
        })),
      }));

      const res = await request(app).get('/api/filme/999');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Film nicht gefunden' });
    });

    it('should return 500 on database error', async () => {
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() =>
            Promise.resolve({
              data: null,
              error: { message: 'Database error' },
            })
          ),
        })),
      }));

      const res = await request(app).get('/api/filme/1');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Database error' });
    });
  });

  describe('GET /filme', () => {
    it('should return movies with active shows', async () => {
      supabase.from
        .mockImplementationOnce(() => ({
          select: jest.fn(() => ({
            gte: jest.fn(() =>
              Promise.resolve({
                data: [{ movie_id: '1' }, { movie_id: '2' }],
                error: null,
              })
            ),
          })),
        }))
        .mockImplementationOnce(() => ({
          select: jest.fn(() => ({
            in: jest.fn(() =>
              Promise.resolve({
                data: [
                  { movie_id: '1', title: 'Movie 1', image: 'movie1.jpg', duration: 90 },
                  { movie_id: '2', title: 'Movie 2', image: 'movie2.jpg', duration: 100 },
                ],
                error: null,
              })
            ),
          })),
        }));

      const res = await request(app).get('/api/filme');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        { movie_id: '1', title: 'Movie 1', image: 'movie1.jpg', duration: 90 },
        { movie_id: '2', title: 'Movie 2', image: 'movie2.jpg', duration: 100 },
      ]);
    });

    it('should return 404 if no shows are found', async () => {
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn(() => ({
          gte: jest.fn(() =>
            Promise.resolve({
              data: [],
              error: null,
            })
          ),
        })),
      }));

      const res = await request(app).get('/api/filme');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Keine Shows gefunden' });
    });

    it('should return 404 if no movies with shows are found', async () => {
      supabase.from
        .mockImplementationOnce(() => ({
          select: jest.fn(() => ({
            gte: jest.fn(() =>
              Promise.resolve({
                data: [{ movie_id: '1' }, { movie_id: '2' }],
                error: null,
              })
            ),
          })),
        }))
        .mockImplementationOnce(() => ({
          select: jest.fn(() => ({
            in: jest.fn(() =>
              Promise.resolve({
                data: [],
                error: null,
              })
            ),
          })),
        }));

      const res = await request(app).get('/api/filme');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Keine Filme mit Vorstellungen gefunden' });
    });

    it('should return 500 if there is a database error while fetching shows', async () => {
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn(() => ({
          gte: jest.fn(() =>
            Promise.resolve({
              data: null,
              error: { message: 'Database error' },
            })
          ),
        })),
      }));

      const res = await request(app).get('/api/filme');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Database error' });
    });

    it('should return 500 if there is a database error while fetching movies', async () => {
      supabase.from
        .mockImplementationOnce(() => ({
          select: jest.fn(() => ({
            gte: jest.fn(() =>
              Promise.resolve({
                data: [{ movie_id: '1' }, { movie_id: '2' }],
                error: null,
              })
            ),
          })),
        }))
        .mockImplementationOnce(() => ({
          select: jest.fn(() => ({
            in: jest.fn(() =>
              Promise.resolve({
                data: null,
                error: { message: 'Database error' },
              })
            ),
          })),
        }));

      const res = await request(app).get('/api/filme');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Database error' });
    });
  });