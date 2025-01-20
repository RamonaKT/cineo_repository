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

jest.setTimeout(30000); // Timeout auf 30 Sekunden erhöhen

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
// mocks.js
const mockSupabaseClient = () => {
    return {
      from: jest.fn(() => ({
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
        upsert: jest.fn().mockResolvedValue({ data: [], error: null }),
        delete: jest.fn().mockResolvedValue({ error: null }),
      })),
    };
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
 
jest.mock('dotenv', () => ({
    config: jest.fn(() => {
      process.env.SUPABASE_URL = 'mock_url';
      process.env.SUPABASE_KEY = 'mock_key';
    }),
  }));  

const supabase = mockSupabaseClient();

const supabaseMockHandlers = {
    from: jest.fn((table) => {
      const handlers = {
        movies: {
            select: jest.fn().mockResolvedValue({
                data: [{ movie_id: 1, title: 'Testfilm' }],
                error: null,
              }),
              eq: jest.fn().mockResolvedValue({
                data: [{ movie_id: 1, title: 'Testfilm' }],
                error: null,
              }),
          insert: jest.fn(() =>
            Promise.resolve({
              data: [{ movie_id: 2, title: 'Neuer Film' }],
              error: null,
            })
          ),
          
          update: jest.fn(() =>
            Promise.resolve({
              data: [{ movie_id: 1, title: 'Bearbeiteter Film' }],
              error: null,
            })
          ),
          delete: jest.fn(() =>
            Promise.resolve({
              data: [{ movie_id: 1 }],
              error: null,
            })
          ),
        },
        seats: {
            select: jest.fn().mockResolvedValue({
                data: [{ seat_id: 101, status: 0 }],
                error: null,
              }),
              eq: jest.fn().mockResolvedValue({
                data: [{ seat_id: 101, status: 0 }],
                error: null,
              }),
        },
      };
  
      // Sicherstellen, dass für jede angefragte Tabelle ein gültiges Objekt zurückgegeben wird
      return handlers[table] || {
        select: jest.fn().mockResolvedValue({ data: null, error: 'Unbekannte Tabelle' }),
        eq: jest.fn().mockResolvedValue({ data: null, error: 'Unbekannte Tabelle' }),
        insert: jest.fn(() =>
          Promise.resolve({ data: null, error: 'Unbekannte Tabelle' })
        ),
        update: jest.fn(() =>
          Promise.resolve({ data: null, error: 'Unbekannte Tabelle' })
        ),
        delete: jest.fn(() =>
          Promise.resolve({ data: null, error: 'Unbekannte Tabelle' })
        ),
      };
    }),
  };
  
  
  supabase.from.mockImplementation((table) => {
    return supabaseMockHandlers.from(table);
  });

createClient.mockReturnValue({
    from: supabaseMockHandlers.from,
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
      const table = 'movies';
      const { data, error } = await supabaseMockHandlers.from(table).select();
  
      const movie_id=1;
      expect(error).toBeNull();
      expect(data).toEqual([{ movie_id: 1, title: 'Testfilm' }]);
  
      // Optional: Teste die tatsächliche API-Route mit Supertest
      const response = await request(app).get('/api/filme/:movie_id');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ movie_id: 1, title: 'Testfilm' });
    });
  
    it('sollte einen Fehler bei unbekannter Tabelle zurückgeben', async () => {
      const table = 'unknown_table';
      const { data, error } = await supabaseMockHandlers.from(table).select();
  
      expect(data).toBeNull();
      expect(error).toBe('Unbekannte Tabelle');
    });
  
    it('sollte einen Film über den gemockten Express-Server abrufen', async () => {
      // Mock für den tatsächlichen Supabase-Aufruf in der API-Route
      supabaseMockHandlers.from('movies').eq.mockResolvedValue({
        data: [{ movie_id: 1, title: 'Testfilm' }],
        error: null,
      });
  
      // Teste, ob die API den Film korrekt zurückgibt
      const response = await request(app).get('/api/filme/1');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ movie_id: 1, title: 'Testfilm' });
    });
  });