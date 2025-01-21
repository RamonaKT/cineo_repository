const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

jest.mock('../../cineo_backend/server', () => jest.fn());

jest.mock('process', () => ({
    env: {
      SUPABASE_URL: 'https://bwtcquzpxgkrositnyrj.supabase.co',
      SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dGNxdXpweGdrcm9zaXRueXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxOTI5NTksImV4cCI6MjA0OTc2ODk1OX0.UYjPNnhS250d31KcmGfs6OJtpuwjaxbd3bebeOZJw9o',
    },
  }));

jest.spyOn(process, 'exit').mockImplementation((code) => {
    console.log(`process.exit wurde mit Code ${code} aufgerufen.`);
});

jest.setTimeout(20000); // Timeout auf 20 Sekunden erhöhen

const routeServer = require ('../../cineo_backend/server');

jest.mock('@supabase/supabase-js', () => {
  const mockClient = {
    from: jest.fn(() => ({
      select: jest.fn(),
      update: jest.fn(),
      eq: jest.fn(),
      in: jest.fn(),
      single: jest.fn(),
      deelte: jest.fn(),
    })),
  };
  return {
    createClient: jest.fn(() => mockClient),
  };
});

jest.mock('axios');
  

let app;
beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  process.env.SUPABASE_URL = 'https://bwtcquzpxgkrositnyrj.supabase.co';
  process.env.SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dGNxdXpweGdrcm9zaXRueXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxOTI5NTksImV4cCI6MjA0OTc2ODk1OX0.UYjPNnhS250d31KcmGfs6OJtpuwjaxbd3bebeOZJw9o';
  const supabaseUrl = 'https://bwtcquzpxgkrositnyrj.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dGNxdXpweGdrcm9zaXRueXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxOTI5NTksImV4cCI6MjA0OTc2ODk1OX0.UYjPNnhS250d31KcmGfs6OJtpuwjaxbd3bebeOZJw9o';
  
  // Mocken der process.exit-Methode, um den Test nicht zu unterbrechen
  jest.spyOn(process, 'exit').mockImplementation((code) => {
    if (code === 1) {
        console.log(`process.exit wurde mit Code ${code} aufgerufen.`);
    }
  });
  app = express();
  app.use(express.json());
  app.use(routeServer);
});
 
jest.mock('dotenv', () => ({
    config: jest.fn(() => {
      process.env.SUPABASE_URL = 'mock_url';
      process.env.SUPABASE_KEY = 'mock_key';
    }),
  }));  

  const supabase = createClient();

supabase.from.mockImplementation((table) => {
  if (table === 'seat') {
    return {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn(() =>
        Promise.resolve({
          data: [
            { seat_id: 1, created_at: '2025-01-12 16:46:14.850837+00', room_id: 999, row_id: 1001, category: 1, status: 1, show_id: 999, reserved_at: '2025-01-15 19:49:49.97+00', reserved_by: '1234' },
            { seat_id: 2, created_at: '2025-01-12 16:46:14.850837+00', room_id: 999, row_id: 1002, category: 2, status: 1, show_id: 999, reserved_at: '2025-01-15 19:49:49.97+00', reserved_by: '1234' },
            { seat_id: 3, created_at: '2025-01-12 16:46:14.850837+00', room_id: 999, row_id: 1002, category: 0, status: 0, show_id: 999, reserved_at: null, reserved_by: null },
          ],
          error: null,
        })
        ),
      update: jest.fn(() =>
        Promise.resolve({
          data: [
            { seat_id: 1, created_at: '2025-01-12 16:46:14.850837+00', room_id: 999, row_id: 1001, category: 1, status: 1, show_id: 999, reserved_at: '2025-01-15 19:49:49.97+00', reserved_by: '1234' },
            { seat_id: 2, created_at: '2025-01-12 16:46:14.850837+00', room_id: 999, row_id: 1002, category: 2, status: 1, show_id: 999, reserved_at: '2025-01-15 19:49:49.97+00', reserved_by: '1234' },
            { seat_id: 3, created_at: '2025-01-12 16:46:14.850837+00', room_id: 999, row_id: 1002, category: 0, status: 0, show_id: 999, reserved_at: null, reserved_by: null },
          ],
          error: null,
        })
        ),
      in: jest.fn(() =>
        Promise.resolve({
          data: [
            { seat_id: 1, created_at: '2025-01-12 16:46:14.850837+00', room_id: 999, row_id: 1001, category: 1, status: 1, show_id: 999, reserved_at: '2025-01-15 19:49:49.97+00', reserved_by: '1234' },
            { seat_id: 2, created_at: '2025-01-12 16:46:14.850837+00', room_id: 999, row_id: 1002, category: 2, status: 1, show_id: 999, reserved_at: '2025-01-15 19:49:49.97+00', reserved_by: '1234' },
            { seat_id: 3, created_at: '2025-01-12 16:46:14.850837+00', room_id: 999, row_id: 1002, category: 0, status: 0, show_id: 999, reserved_at: null, reserved_by: null },
          ],
          error: null,
        })
      ),
    };
  }
  if (table === 'seat') {
    return {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn(() =>
        Promise.resolve({
          data: [
            {movie_id: 1, Film: 'Testfilm'},
          ],
          error: null,
        })
        ),
      update: jest.fn(() =>
        Promise.resolve({
          data: [
            {movie_id: 1, Film: 'Testfilm'},
          ],
          error: null,
        })
        ),
      in: jest.fn(() =>
        Promise.resolve({
          data: [
            {movie_id: 1, Film: 'Testfilm'},
          ],
          error: null,
        })
      ),
    };
  }
  return {};
});


describe('Minimaler Test', () => {
    it('sollte immer bestehen', () => {
      expect(true).toBe(true);
    });
  });

  describe('Test für process.exit', () => {
    let logSpy;
  
    beforeAll(() => {
      // Mock für process.exit
      jest.spyOn(process, 'exit').mockImplementation((code) => {
        console.log('process.exit wurde mit Code ${code} aufgerufen.');
      });
  
      // Mock für console.log
      logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  
      // Mock für Umgebungsvariablen
      jest.mock('process', () => ({
        env: {
          SUPABASE_URL: 'https://bwtcquzpxgkrositnyrj.supabase.co',
          SUPABASE_KEY: null,
        },
      }));
    });
  
    afterAll(() => {
      // Mocks zurücksetzen
      jest.restoreAllMocks();
    });
  
    it('sollte process.exit mocken und nicht abbrechen', () => {
      // Prozess mit exit(1) beenden
      process.exit(1);
  
      expect(logSpy).toHaveBeenCalledWith('process.exit wurde mit Code 1 aufgerufen.');

    });
});


describe('Server und Supabase Mock Tests', () => {
    let app;
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
      app = express();
      app.use(express.json());
      app.use(routeServer);  // Der gemockte Server wird hier eingebunden
    });
  
    it('sollte einen Film abrufen', async () => {
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn(() =>
            Promise.resolve({
            data: [
                {movie_id: 1, title: 'Testfilm'},
            ],
            status: 200,
            error: null,
            })
        ),
    }));
      
    const response = await request(app).get('/api/filme/1');

    expect(error).toBeNull();
    expect(response.data).toEqual([{ movie_id: 1, title: 'Testfilm' }]);
    expect(response.status).toBe(200);
    });
  
});


describe('fetchMovieDetails', () => {
  const movieId = 1;
  const mockApiResponse = {
      data: {
          runtime: 120,
          genres: [
              { name: 'Action' },
              { name: 'Drama' },
          ],
      },
  };

  it('sollte erfolgreich die Filmdetails abrufen', async () => {
      axios.get.mockResolvedValue(mockApiResponse);

      const result = await fetchMovieDetails(movieId);

      expect(axios.get).toHaveBeenCalledWith(
          `${process.env.TMDB_BASE_URL}/movie/${movieId}`,
          { params: { api_key: process.env.TMDB_API_KEY, language: 'de-DE' } }
      );

      expect(result).toEqual({
          runtime: 120,
          genres: ['Action', 'Drama'],
      });
  });

  it('sollte Fehler abfangen und eine leere Antwort zurückgeben, wenn die API fehlschlägt', async () => {
      axios.get.mockRejectedValue(new Error('Fehler beim Abrufen der Filmdetails'));

      const result = await fetchMovieDetails(movieId);

      expect(axios.get).toHaveBeenCalledWith(
          `${process.env.TMDB_BASE_URL}/movie/${movieId}`,
          { params: { api_key: process.env.TMDB_API_KEY, language: 'de-DE' } }
      );

      expect(result).toEqual({ runtime: null, genres: [] });
  });

  it('sollte die Genres korrekt extrahieren, wenn die Antwort keine Genres enthält', async () => {
      const mockEmptyGenreResponse = {
          data: {
              runtime: 90,
              genres: [],
          },
      };

      axios.get.mockResolvedValue(mockEmptyGenreResponse);

      const result = await fetchMovieDetails(movieId);

      expect(result).toEqual({
          runtime: 90,
          genres: [],
      });
  });
});
