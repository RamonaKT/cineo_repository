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

jest.setTimeout(60000); // Timeout auf 60 Sekunden erhöhen

const routeServer = require ('../../cineo_backend/server');

jest.mock('@supabase/supabase-js', () => {
    const mockClient = {
      from: jest.fn(() => ({
        select: jest.fn(),
        update: jest.fn(),
        eq: jest.fn(),
        in: jest.fn(),
      })),
    };
    return {
      createClient: jest.fn(() => mockClient),
    };
  });

jest.mock('axios');

// Mock für Supabase Client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({ data: [], error: null })),
    insert: jest.fn(() => ({ data: [], error: null })),
    delete: jest.fn(() => ({ error: null })),
  })),
};

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
 

createClient.mockReturnValue(mockSupabase);


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
        console.log(`process.exit wurde mit Code ${code} aufgerufen.`);
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
  
      // Überprüfen, ob console.log mit dem richtigen Argument aufgerufen wurde
      expect(logSpy).toHaveBeenCalledWith('process.exit wurde mit Code 1 aufgerufen.');
  
      // Weitere Assertions
      expect(1 + 1).toBe(2); // Beispiel für eine zusätzliche Assertion
    });
  });
  
  

// Testen der API-Endpunkte
describe('API Endpunkte', () => {
  // Test für GET /api/filme/:movieId
  it('sollte einen Film finden', async () => {
    mockSupabase.from().select.mockReturnValueOnce({
      data: [{ movie_id: 1, title: 'Film 1' }],
      error: null,
    });

    const response = await request(app).get('/api/filme/1');
    expect(response.status).toBe(200);
    expect(response.body.movie_id).toBe(1);
    expect(response.body.title).toBe('Film 1');
  });

  it('sollte einen 404 Fehler zurückgeben, wenn der Film nicht gefunden wird', async () => {
    mockSupabase.from().select.mockReturnValueOnce({
      data: [],
      error: null,
    });

    const response = await request(app).get('/api/filme/999');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Film nicht gefunden');
  });

  // Testen für POST /api/vorstellungen
  it('sollte eine Vorstellung erfolgreich hinzufügen', async () => {
    const newShow = {
      movie_id: 1,
      date: '2025-01-18',
      time: '18:00',
      end_time: '20:00',
      room_id: 2,
      movie_duration: 120,
    };

    mockSupabase.from().insert.mockReturnValueOnce({
      data: [{ show_id: 1, ...newShow }],
      error: null,
    });

    const response = await request(app)
      .post('/api/vorstellungen')
      .send(newShow);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Vorstellung erfolgreich hinzugefügt');
    expect(response.body.data.show_id).toBe(1);
  });

  it('sollte einen Fehler zurückgeben, wenn erforderliche Daten fehlen', async () => {
    const newShow = {
      movie_id: 1,
      date: '2025-01-18',
      time: '18:00',
      room_id: 2,
    };

    const response = await request(app)
      .post('/api/vorstellungen')
      .send(newShow);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Fehlende Daten: movie_id, date, time, room_id und movie_duration sind erforderlich');
  });

  // Testen für DELETE /api/vorstellungen/:id
  it('sollte eine Vorstellung erfolgreich löschen', async () => {
    const showId = 1;

    mockSupabase.from().delete.mockReturnValueOnce({
      error: null,
    });

    const response = await request(app).delete(`/api/vorstellungen/${showId}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Vorstellung erfolgreich gelöscht');
  });

  it('sollte einen Fehler zurückgeben, wenn das Löschen der Vorstellung fehlschlägt', async () => {
    const showId = 999;

    mockSupabase.from().delete.mockReturnValueOnce({
      error: { message: 'Fehler beim Löschen der Vorstellung' },
    });

    const response = await request(app).delete(`/api/vorstellungen/${showId}`);
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Fehler beim Löschen der Vorstellung');
  });

  // Testen für die TMDB API
  it('sollte Filme von der TMDB API abrufen', async () => {
    const mockMovies = [
      {
        id: 1,
        title: 'Film 1',
        overview: 'Beschreibung des Films',
        release_date: '2025-01-01',
        poster_path: '/path/to/poster.jpg',
      },
    ];

    axios.get.mockResolvedValue({
      data: { results: mockMovies },
    });

    const movies = await fetchPopularMovies(1);
    expect(movies).toHaveLength(1);
    expect(movies[0].title).toBe('Film 1');
  });
});
