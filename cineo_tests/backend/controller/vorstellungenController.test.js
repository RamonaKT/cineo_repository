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
const routerVorstellungen = require('../../../cineo_backend/src/controller/vorstellungenController');

// Mock-Datenbankinitialisierung
const supabase = createClient();


let app;
beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  app = express();
  app.use(express.json());
  app.use('/api/vorstellungen', routerVorstellungen);
});


describe('GET /vorstellungen/:movieId', () => {
    it('should return show data for a movieId', async () => {
        supabase.from.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn(() =>
                Promise.resolve({
                    data: [{ show_id: 1, movie_id: 123, date: '2025-01-20' }],
                    error: null,
                })
            ),
        }));

        const res = await request(app).get('/api/vorstellungen/123');
        expect(res.body).toEqual([{ show_id: 1, movie_id: 123, date: '2025-01-20' }]);
        expect(res.status).toBe(200);
    });

    it('should return 404 if no shows found', async () => {
        supabase.from.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn(() =>
                Promise.resolve({
                    data: [],
                    error: null,
                })
            ),
        }));

        const res = await request(app).get('/api/vorstellungen/123');
        expect(res.status).toBe(404);
    });

    it('should return 500 on Supabase error', async () => {
        supabase.from.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn(() =>
                Promise.resolve({
                    data: {movie_id:123},
                    error: { message: 'Supabase-Fehler' },
                })
            ),
        }));

        const res = await request(app).get('/api/vorstellungen/123');
        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'Supabase-Fehler' });
    });
});

describe('DELETE /vorstellungen/:id', () => {
    it('should delete a show by ID', async () => {
        supabase.from.mockImplementationOnce(() => ({
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn(() =>
                Promise.resolve({
                    status:204,
                    error: null,
                })
            ),
        }));

        const res = await request(app).delete('/api/vorstellungen/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'Vorstellung erfolgreich gelöscht' });
    });

    it('should return 500 on Supabase error', async () => {
        supabase.from.mockImplementationOnce(() => ({
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn(() =>
                Promise.resolve({
                    data: null,
                    error: { message: 'Supabase-Fehler' },
                })
            ),
        }));

        const res = await request(app).delete('/api/vorstellungen/1');
        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            message: 'Fehler beim Löschen der Vorstellung',
            error: 'Supabase-Fehler',
        });
    });
});

describe('POST /vorstellungen', () => {
    it('should create a new show', async () => {
    supabase.from
    .mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(() =>
            Promise.resolve({
                data: { title: 'test' }, 
                error: null,
            })
        ),
    }))
    .mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn(() =>
            Promise.resolve({
                data: { show_id: 123 }, 
                error: null,
            })
        ),
    }));


        const res = await request(app)
            .post('/api/vorstellungen')
            .send({       
                movie_id: 123,
                date: '2025-01-20',
                time: '12:00',
                end_time: '14:00',
                room_id: 1,
                movie_duration: 120,
            });

        expect(res.status).toBe(201);
        expect(res.body).toEqual({
            message: 'Vorstellung erfolgreich hinzugefügt',
            data: { show_id: 123 },
        });
    });

    it('should return 400 if required fields are missing', async () => {
        const res = await request(app).post('/api/vorstellungen').send({movie_is: null, date: null, time: null, room_id: null, movie_duration: null});

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            message:
                'Fehlende Daten: movie_id, date, time, room_id und movie_duration sind erforderlich',
        });
    });

    it('should return 404 if movie not found', async () => {
        supabase.from
        .mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(() =>
                Promise.resolve({
                    data: null, 
                    error: null,
                })
            ),
        }))
        .mockImplementationOnce(() => ({
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn(() =>
                Promise.resolve({
                    data: null, 
                    error: null,
                })
            ),
        }));

        const res = await request(app)
            .post('/api/vorstellungen')
            .send({
                movie_id: 123,
                date: '2025-01-20',
                time: '12:00',
                end_time: '14:00',
                room_id: 1,
                movie_duration: 120,
            });

        expect(res.status).toBe(404);
    });

    it('should return 500 on Supabase error during creation', async () => {
        supabase.from
            .mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn(() =>
                    Promise.resolve({
                        data: { title: 'Test Movie'},
                        error: null,
                    })
                ),
            }))
            .mockImplementationOnce(() => ({
                insert: jest.fn().mockReturnThis(),
                select: jest.fn(() =>
                    Promise.resolve({
                        data: null,
                        error: { message: 'Supabase-Fehler' },
                    })
                ),
            }));

        const res = await request(app)
            .post('/api/vorstellungen')
            .send({
                movie_id: '123',
                date: '2025-01-20',
                time: '12:00',
                end_time: '14:00',
                room_id: 1,
                movie_duration: 120,
            });

        expect(res.status).toBe(500);
    });
});