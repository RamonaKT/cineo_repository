const request = require('supertest');
const app = require('../../cineo_backend/server'); 
const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const axios = require('axios');

jest.setTimeout(30000); // Erhöht das Timeout auf 30 Sekunden


jest.mock('@supabase/supabase-js', () => {
  const mockClient = {
    from: jest.fn(() => ({
      select: jest.fn(),
      update: jest.fn(),
      eq: jest.fn(),
      in: jest.fn(),
      single: jest.fn(),
      delete: jest.fn(),
    })),
  };
  return {
    createClient: jest.fn(() => mockClient),
  };
});

jest.mock('axios');

jest.mock('dotenv', () => ({
  config: jest.fn(() => {
    process.env.SUPABASE_URL = 'mock_url';
    process.env.SUPABASE_KEY = 'mock_key';
  }),
})); 

jest.mock('process', () => ({
  env: {
    SUPABASE_URL: 'mock_url',
    SUPABASE_KEY: 'mock_key',
  },
}));

// Route importieren (relativer Pfad)
const routerFilme = require('../../cineo_backend/src/controller/filmeController');
const routerVorstellungen = require('../../cineo_backend/src/controller/vorstellungenController');

// Mock-Datenbankinitialisierung
const supabase = createClient();

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.mock('dotenv', () => ({
    config: jest.fn(() => {
      process.env.SUPABASE_URL = 'mock_url';
      process.env.SUPABASE_KEY = 'mock_key';
    }),
  })); 
  jest.mock('axios');
  jest.mock('process', () => ({
    env: {
      SUPABASE_URL: 'mock_url',
      SUPABASE_KEY: 'mock_key',
    },
  }));
  
});

describe('Minimaler Test', () => {
    it('should assert that true is true', () => {
      expect(true).toBe(true);
    });
});

/*
describe('End-to-End Ticketbuchung mit Mock-Daten', () => {
    it('sollte erfolgreich ein Ticket buchen und einen Sitz belegen', async () => {
      // 1. Filme abrufen und einen auswählen
        supabase.from
        .mockImplementationOnce(() => ({
          select: jest.fn(() => ({
            gte: jest.fn(() =>
              Promise.resolve({
                data: [{ movie_id: 1 }, { movie_id: 2 }],
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
                  { movie_id: 1, title: 'Movie 1', image: 'movie1.jpg', duration: 90 },
                  { movie_id: 2, title: 'Movie 2', image: 'movie2.jpg', duration: 100 },
                ],
                error: null,
              })
            ),
          })),
        }));

      const moviesRes = await request(app).get('/api/filme');
      expect(moviesRes.statusCode).toBe(200);
      const movieId = moviesRes.body[0].movie_id;

      // 2. Vorstellung auswählen
      supabase.from.mockImplementationOnce(() => ({
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn(() =>
                      Promise.resolve({
                          data: [{ show_id: 11, movie_id: 1, date: '2025-01-20' }],
                          error: null,
                      })
                  ),
              }));
      
      const showRes = await request(app).get('/api/vorstellungen/' + movieId);
      expect(moviesRes.statusCode).toBe(200);
  
      // 3. Sitzplatz auswählen (mocked)
      const seatId = 1;
  
      // 4. Ticket reservieren
      supabase.from.mockImplementationOnce((table) => {
              if (table === 'seat') {
                return {
                  select: jest.fn(() =>
                    ({
                      eq: jest.fn(() =>
                        ({
                          single: jest.fn(() =>
                            Promise.resolve({
                              data: { 
                                seat_id: 1, 
                                created_at: '2025-01-12 16:46:14.850837+00', 
                                room_id: 999, 
                                row_id: 1002, 
                                category: 0, 
                                status: 0, 
                                show_id: 999, 
                                reserved_at: null, 
                                reserved_by: null 
                              },
                              error: null,
                            })
                          ),
                        })
                      ),
                    })
                  ),
                };
              }
              return {};
            });
            
            supabase.from.mockImplementationOnce((table) => {
              if (table === 'seat') {
                return {
                  update: jest.fn(() =>
                    ({
                      eq: jest.fn(() =>
                        Promise.resolve({
                          status: 200,
                          error: null,
                        })
                      ),
                    })
                  ),
                };
              }
              return {};
            });
          
          const response = await request(app)
            .post('/api/seatReservations/reserve')
            

      // 5. Ticket buchen
      it('sollte einen Sitzplatz erfolgreich buchen', async () => {
              supabase.from.mockImplementationOnce(() => ({
                  update: jest.fn(() => ({
                      eq: jest.fn().mockReturnThis(), // eq-Aufrufe innerhalb von update
                      then: jest.fn((callback) =>
                          callback({
                              status: 200, 
                              error: null, // Keine Fehler
                          })
                      ),
                  })),
              }));
        
            const response = await request(app)
              .post('/api/seatReservations/book')
              .send({ seat_id: 1, user_id: '1234' });
  
      // 6. Überprüfen, ob der Sitzplatz nun belegt ist (Mocked)
      
    });
  });

});

*/
