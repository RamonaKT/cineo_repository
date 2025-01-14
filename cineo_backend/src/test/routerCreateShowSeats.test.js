const request = require('supertest');
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const routerCreateShowSeats = require('./routerCreateShowSeats');

// Mock für Supabase
jest.mock('@supabase/supabase-js', () => {
    return {
        createClient: jest.fn(() => ({
            from: jest.fn(() => ({
                select: jest.fn(),
                upsert: jest.fn(),
            })),
        })),
    };
});

const supabaseMock = createClient();

describe('POST /create - Create Show Seats', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/api/seats', routerCreateShowSeats);
    });

    it('should return 201 when seats are successfully created', async () => {
        // Mock existing seats
        supabaseMock.from.mockReturnValueOnce({
            select: jest.fn().mockResolvedValueOnce({
                data: [
                    { id: 1, room_id: 101, show_id: null },
                    { id: 2, room_id: 101, show_id: null },
                ],
                error: null,
            }),
        });

        // Mock upsert success
        supabaseMock.from.mockReturnValueOnce({
            upsert: jest.fn().mockResolvedValueOnce({ error: null }),
        });

        const response = await request(app)
            .post('/api/seats/create')
            .send({ room_id: 101, show_id: 999 });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Sitzplätze erfolgreich erstellt.');
    });

    it('should return 404 if no seats are found', async () => {
        // Mock no seats found
        supabaseMock.from.mockReturnValueOnce({
            select: jest.fn().mockResolvedValueOnce({
                data: [],
                error: null,
            }),
        });

        const response = await request(app)
            .post('/api/seats/create')
            .send({ room_id: 101, show_id: 999 });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Keine Sitzplätze zum Erstellen gefunden.');
    });

    it('should return 500 if select query fails', async () => {
        // Mock select error
        supabaseMock.from.mockReturnValueOnce({
            select: jest.fn().mockResolvedValueOnce({
                data: null,
                error: 'Select query failed',
            }),
        });

        const response = await request(app)
            .post('/api/seats/create')
            .send({ room_id: 101, show_id: 999 });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Fehler beim Abrufen der Sitzplätze.');
    });

    it('should return 500 if upsert query fails', async () => {
        // Mock existing seats
        supabaseMock.from.mockReturnValueOnce({
            select: jest.fn().mockResolvedValueOnce({
                data: [
                    { id: 1, room_id: 101, show_id: null },
                    { id: 2, room_id: 101, show_id: null },
                ],
                error: null,
            }),
        });

        // Mock upsert error
        supabaseMock.from.mockReturnValueOnce({
            upsert: jest.fn().mockResolvedValueOnce({ error: 'Upsert failed' }),
        });

        const response = await request(app)
            .post('/api/seats/create')
            .send({ room_id: 101, show_id: 999 });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Fehler beim Einfügen der Sitzplätze.');
    });
});
