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
const mainRouter = require('../../../cineo_backend/src/controller/mainController');

// Mock-Datenbankinitialisierung
const supabase = createClient();


let app;
beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  app = express();
  app.use(express.json());
  app.use('/api', mainRouter);
});

describe('/alleVorstellungen', () => {
    it('sollte alle Vorstellungen abrufen (Erfolgsfall)', async () => {
        supabaseClient.from.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            then: jest.fn((cb) => cb({
                data: [
                    { show_id: 1, date: '2025-01-20', time: '12:00', movie_title: 'Film A', room_id: 1 },
                    { show_id: 2, date: '2025-01-21', time: '14:00', movie_title: 'Film B', room_id: 2 },
                ],
                error: null,
            })),
        }));

        const res = await request(app).get('/api/alleVorstellungen');

        expect(res.status).toBe(200);
        expect(res.body).toEqual([
            { show_id: 1, date: '2025-01-20', time: '12:00', movie_title: 'Film A', room_id: 1 },
            { show_id: 2, date: '2025-01-21', time: '14:00', movie_title: 'Film B', room_id: 2 },
        ]);
    });

    it('sollte einen Fehler zurückgeben, wenn keine Vorstellungen gefunden wurden', async () => {
        supabaseClient.from.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            then: jest.fn((cb) => cb({
                data: [],
                error: null,
            })),
        }));

        const res = await request(app).get('/api/alleVorstellungen');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'Keine Vorstellungen gefunden' });
    });

    it('sollte einen Fehler zurückgeben, wenn die Datenbank fehlschlägt', async () => {
        supabaseClient.from.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            then: jest.fn((cb) => cb({
                data: null,
                error: { message: 'Datenbankfehler' },
            })),
        }));

        const res = await request(app).get('/api/alleVorstellungen');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            message: 'Fehler beim Abrufen der Vorstellungen',
            error: 'Datenbankfehler',
        });
    });
});

describe('/alleFilme', () => {
    it('sollte alle Filme abrufen (Erfolgsfall)', async () => {
        supabaseClient.from.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            then: jest.fn((cb) => cb({
                data: [
                    { movie_id: 1, title: 'Film A', image: 'image_a.jpg', duration: 120 },
                    { movie_id: 2, title: 'Film B', image: 'image_b.jpg', duration: 90 },
                ],
                error: null,
            })),
        }));

        const res = await request(app).get('/api/alleFilme');

        expect(res.status).toBe(200);
        expect(res.body).toEqual([
            { movie_id: 1, title: 'Film A', image: 'image_a.jpg', duration: 120 },
            { movie_id: 2, title: 'Film B', image: 'image_b.jpg', duration: 90 },
        ]);
    });

    it('sollte einen Fehler zurückgeben, wenn keine Filme gefunden wurden', async () => {
        supabaseClient.from.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            then: jest.fn((cb) => cb({
                data: [],
                error: null,
            })),
        }));

        const res = await request(app).get('/api/alleFilme');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'Keine Filme gefunden' });
    });

    it('sollte einen Fehler zurückgeben, wenn die Datenbank fehlschlägt', async () => {
        supabaseClient.from.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            then: jest.fn((cb) => cb({
                data: null,
                error: { message: 'Datenbankfehler' },
            })),
        }));

        const res = await request(app).get('/api/alleFilme');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'Datenbankfehler' });
    });
});

describe('/rooms', () => {
    it('sollte verfügbare Räume zurückgeben (Erfolgsfall)', async () => {
        supabaseClient.from.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(() =>
                Promise.resolve({
                    data: { duration: 120 },
                    error: null,
                })
            ),
        }));
        supabaseClient.from.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            filter: jest.fn().mockReturnThis(),
            then: jest.fn((cb) => cb({
                data: [{ room_id: 1, time: '12:00', end_time: '14:00' }],
                error: null,
            })),
        }));
        supabaseClient.from.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            not: jest.fn().mockReturnThis(),
            then: jest.fn((cb) => cb({
                data: [{ room_id: 2 }],
                error: null,
            })),
        }));

        const res = await request(app)
            .get('/api/rooms')
            .query({ date: '2025-01-20', time: '12:00', movie_id: 1 });

        expect(res.status).toBe(200);
        expect(res.body).toEqual([{ room_id: 2 }]);
    });

    it('sollte einen Fehler zurückgeben, wenn Datenbankabfrage fehlschlägt', async () => {
        supabaseClient.from.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(() =>
                Promise.resolve({
                    data: null,
                    error: { message: 'Fehler beim Abrufen des Films' },
                })
            ),
        }));

        const res = await request(app)
            .get('/api/rooms')
            .query({ date: '2025-01-20', time: '12:00', movie_id: 1 });

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'Film nicht gefunden!' });
    });
});

describe('/tickets', () => {
    it('soll ein Ticket erfolgreich speichern', async () => {
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({ data: { room_id: 1 }, error: null }),
      }));
  
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({ data: { capacity: 100 }, error: null }),
      }));
  
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      }));
  
      supabase.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockResolvedValue({ data: { ticket_id: 1 }, error: null }),
      }));
  
      const response = await request(app).post('/tickets').send({
        show_id: 1,
        ticket_type: 'Standard',
        price: 12,
      });
  
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: 'Ticket erfolgreich gespeichert',
        ticket: { ticket_id: 1 },
      });
    });
  
    it('soll 400 zurückgeben, wenn die Kapazität überschritten wird', async () => {
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({ data: { room_id: 1 }, error: null }),
      }));
  
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({ data: { capacity: 1 }, error: null }),
      }));
  
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({ data: [{ ticket_id: 1 }], error: null }),
      }));
  
      const response = await request(app).post('/tickets').send({
        show_id: 1,
        ticket_type: 'Standard',
        price: 12,
      });
  
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Kapazität überschritten' });
    });
  
    it('soll 500 zurückgeben, wenn ein Fehler auftritt', async () => {
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockRejectedValue(new Error('Fehler beim Abrufen')),
      }));
  
      const response = await request(app).post('/tickets').send({
        show_id: 1,
        ticket_type: 'Standard',
        price: 12,
      });
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Fehler beim Abrufen' });
    });
  });
  