const request = require('supertest');
const express = require('express');  // Stelle sicher, dass express korrekt importiert wird
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const routerSeatReservations = require('../../../cineo_backend/src/controller/seatReservationsController'); // Stelle sicher, dass der Pfad korrekt ist

jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnThis(),
        select: jest.fn(),
        update: jest.fn(),
    })
}));

const supabase = createClient();
supabase.from.mockImplementation((table) => {
    if (table === 'seat') {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn(() =>
          Promise.resolve({
            data: [
              { seat_id: 1, room_id: 999, row_id: 1, category: 1, reserved_by: null },
              { seat_id: 2, room_id: 999, row_id: 1, category: 2, reserved_by: null },
            ],
            error: null,
          })
        ),
        upsert: jest.fn(() =>
          Promise.resolve({
            data: [
              {
                seat_id: 99910000001,
                room_id: 999,
                row_id: 1,
                category: 1,
                status: 0,
                show_id: 999,
                seat_number: 1,
                reserved_at: null,
                reserved_by: null,
              },
              {
                seat_id: 99910000002,
                room_id: 999,
                row_id: 1,
                category: 2,
                status: 0,
                show_id: 999,
                seat_number: 2,
                reserved_at: null,
                reserved_by: null,
              },
            ],
            error: null,
          })
        ),
      };
    }
  });

describe('Seat Reservations Controller', () => {
    let app;
    let supabase;

    beforeEach(() => {
        app = express();
        app.use(bodyParser.json());
        app.use('/api/seatReservations', routerSeatReservations);

        // Mock Supabase-Client
        supabase = createClient();
    });

    describe('GET /api/seatReservations/seats', () => {
        it('sollte Sitzplatzdaten für eine Show abrufen', async () => {
            // Mock Supabase antwortet mit Sitzplatzdaten
            supabase.from.mockImplementationOnce(() => ({
                select: jest.fn().mockResolvedValue({
                    data: [{ seat_id: 1, reserved_by: null }],
                    error: null,
                })
            }));

            const response = await request(app).get('/api/seatReservations/seats').query({ show_id: '123' });
            expect(response.status).toBe(200);
        });

        it('sollte einen Fehler zurückgeben, wenn keine Sitzplätze gefunden wurden', async () => {
            // Mock Supabase gibt keine Daten zurück
            supabase.from.mockImplementationOnce(() => ({
                select: jest.fn().mockResolvedValue({
                    data: [],
                    error: null,
                })
            }));

            const response = await request(app).get('/api/seatReservations/seats').query({ show_id: '999' });
            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/seatReservations/reserve', () => {
        it('sollte einen Sitzplatz erfolgreich reservieren', async () => {
            // Mock Supabase gibt eine erfolgreiche Antwort zurück
            supabase.from.mockImplementationOnce(() => ({
                update: jest.fn().mockResolvedValue({
                    status: 204,
                    error: null,
                })
            }));

            const requestData = { seat_id: 1, session_id: 123 };
            const response = await request(app).post('/api/seatReservations/reserve').send(requestData);
            expect(response.status).toBe(200);
        });

        it('sollte einen Fehler zurückgeben, wenn der Sitzplatz bereits reserviert ist', async () => {
            // Mock Supabase gibt einen Fehler zurück
            supabase.from.mockImplementationOnce(() => ({
                update: jest.fn().mockResolvedValue({
                    status: 409,
                    error: null,
                })
            }));

            const requestData = { seat_id: 1, session_id: 123 };
            const response = await request(app).post('/api/seatReservations/reserve').send(requestData);
            expect(response.status).toBe(409);
        });

        it('sollte einen Fehler zurückgeben, wenn der Sitzplatz nicht verfügbar ist', async () => {
            // Mock Supabase gibt einen Fehler zurück
            supabase.from.mockImplementationOnce(() => ({
                update: jest.fn().mockResolvedValue({
                    status: 409,
                    error: null,
                })
            }));

            const requestData = { seat_id: 1, session_id: 123 };
            const response = await request(app).post('/api/seatReservations/reserve').send(requestData);
            expect(response.status).toBe(409);
        });
    });

    describe('POST /api/seatReservations/release', () => {
        it('sollte einen Sitzplatz erfolgreich freigeben', async () => {
            // Mock Supabase gibt eine erfolgreiche Antwort zurück
            supabase.from.mockImplementationOnce(() => ({
                update: jest.fn().mockResolvedValue({
                    status: 200,
                    error: null,
                })
            }));

            const requestData = { seat_id: 1, session_id: 123 };
            const response = await request(app).post('/api/seatReservations/release').send(requestData);
            expect(response.status).toBe(200);
        });

        it('sollte einen Fehler zurückgeben, wenn beim Freigeben des Sitzplatzes ein Fehler auftritt', async () => {
            // Mock Supabase gibt einen Fehler zurück
            supabase.from.mockImplementationOnce(() => ({
                update: jest.fn().mockResolvedValue({
                    status: 500,
                    error: 'Datenbankfehler',
                })
            }));

            const requestData = { seat_id: 1, session_id: 123 };
            const response = await request(app).post('/api/seatReservations/release').send(requestData);
            expect(response.status).toBe(500);
        });
    });

    describe('POST /api/seatReservations/check', () => {
        it('sollte die Reservierungen für mehrere Sitzplätze überprüfen', async () => {
            // Mock Supabase gibt eine erfolgreiche Antwort zurück
            supabase.from.mockImplementationOnce(() => ({
                select: jest.fn().mockResolvedValue({
                    data: [
                        { seat_id: 1, reserved_by: 'sess-123' },
                        { seat_id: 2, reserved_by: 'sess-123' }
                    ],
                    error: null,
                })
            }));

            const requestData = { selectedSeats: [1, 2], sessionId: 'sess-123' };
            const response = await request(app).post('/api/seatReservations/check').send(requestData);
            expect(response.status).toBe(200);
            expect(response.body.allReserved).toBe(true);
        });

        it('sollte einen Fehler zurückgeben, wenn eine ungültige Sitzplatzauswahl übergeben wird', async () => {
            const requestData = { selectedSeats: [], sessionId: 123 };
            const response = await request(app).post('/api/seatReservations/check').send(requestData);
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Ungültige Sitzplatzauswahl');
        });
    });
});
