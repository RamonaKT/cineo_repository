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
const routerSeatReservations = require('../../../cineo_backend/src/controller/seatReservationsController');

// Mock-Datenbankinitialisierung
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
  return {};
});

let app;
beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  app = express();
  app.use(express.json());
  app.use('/api/seatReservations', routerSeatReservations);
});

// Tests
describe('GET /api/seatReservations/seats', () => {
  it('sollte Sitzplätze für eine gegebene show_id zurückgeben', async () => {
    supabase.from.mockImplementationOnce(() => ({
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
    }));
    
    const response = await request(app).get('/api/seatReservations/seats').query({ show_id: 999 });
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
        { seat_id: 1, created_at: '2025-01-12 16:46:14.850837+00', room_id: 999, row_id: 1001, category: 1, status: 1, show_id: 999, reserved_at: '2025-01-15 19:49:49.97+00', reserved_by: '1234' },
        { seat_id: 2, created_at: '2025-01-12 16:46:14.850837+00', room_id: 999, row_id: 1002, category: 2, status: 1, show_id: 999, reserved_at: '2025-01-15 19:49:49.97+00', reserved_by: '1234' },
        { seat_id: 3, created_at: '2025-01-12 16:46:14.850837+00', room_id: 999, row_id: 1002, category: 0, status: 0, show_id: 999, reserved_at: null, reserved_by: null },
    ]);
  });

  it('sollte eine 404 zurückgeben, wenn keine Sitzplätze gefunden werden', async () => {
    supabase.from.mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn(() =>
        Promise.resolve({
          data: [],
          error: null,
        })
      ),
    }));

    const response = await request(app).get('/api/seatReservations/seats').query({ show_id: 99 });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Keine Sitzplätze gefunden');
  });
});

describe('POST /api/seatReservations/reserve', () => {
  it('sollte einen Sitzplatz erfolgreich reservieren', async () => {
    supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        single: jest.fn(() =>
            Promise.resolve({
            status: 204,
            error: null,
            })
        ),
    }));
    
    const response = await request(app)
      .post('/api/seatReservations/reserve')
      .send({ seat_id: 3, session_id: 1234 });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Sitzplatz erfolgreich reserviert');
  });

  it('sollte eine 409 zurückgeben, wenn der Sitzplatz bereits reserviert ist', async () => {
    supabase.from.mockImplementationOnce(() => ({
      update: jest.fn(() =>
        Promise.resolve({
          data: null,
          error: { message: 'Sitzplatz bereits reserviert oder nicht mehr verfügbar.' },
        })
      ),
    }));

    const response = await request(app)
      .post('/api/seatReservations/reserve')
      .send({ seat_id: 1, session_id: 1234 });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Sitzplatz bereits reserviert oder nicht mehr verfügbar.');
  });
});

describe('POST /api/seatReservations/release', () => {
  it('sollte einen Sitzplatz erfolgreich freigeben', async () => {
    supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        update: jest.fn(() =>
            Promise.resolve({
            status: 204,
            error: null,
            })
        ),
    }));
    
    const response = await request(app)
      .post('/api/seatReservations/release')
      .send({ seat_id: 1, session_id: 1234 });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Sitzplatz erfolgreich freigegeben');
  });

  it('sollte eine 404 zurückgeben, wenn der Sitzplatz nicht gefunden wurde', async () => {
    supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
       eq: jest.fn().mockReturnThis(),
        update: jest.fn(() =>
        Promise.resolve({
          data: null,
          error: { message: 'Sitzplatz nicht gefunden' },
        })
      ),
    }));

    const response = await request(app)
      .post('/api/seatReservations/release')
      .send({ seat_id: 1, session_id: 1234 });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Sitzplatz nicht gefunden');
  });
});

describe('POST /api/seatReservations/check', () => {
  it('sollte überprüfen, ob alle Sitzplätze von einer Sitzung reserviert wurden', async () => {
    supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        in: jest.fn(() =>
            Promise.resolve({
            data: [
                { seat_id: 1, created_at: '2025-01-12 16:46:14.850837+00', room_id: 999, row_id: 1001, category: 1, status: 1, show_id: 999, reserved_at: '2025-01-15 19:49:49.97+00', reserved_by: 1234 },
                { seat_id: 2, created_at: '2025-01-12 16:46:14.850837+00', room_id: 999, row_id: 1002, category: 2, status: 1, show_id: 999, reserved_at: '2025-01-15 19:49:49.97+00', reserved_by: 1234 },
            ],
            error: null,
            })
        ),
    }));
    
    const response = await request(app)
      .post('/api/seatReservations/check')
      .send({ selectedSeats: [1, 2], sessionId: 1234 });

    expect(response.status).toBe(200);
    expect(response.body.allReserved).toBe(true);
  });

  it('sollte eine 400 zurückgeben, wenn keine Sitzplätze ausgewählt wurden', async () => {
    const response = await request(app).post('/api/seatReservations/check').send({ selectedSeats: [], sessionId: 1234 });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Ungültige Sitzplatzauswahl');
  });
});

describe('POST /api/seatReservations/expire', () => {
    it('sollte abgelaufene Reservierungen erfolgreich freigeben', async () => {
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        update: jest.fn(() =>
          Promise.resolve({
            data: null,
            error: null,
          })
        ),
        lt: jest.fn(() =>
            Promise.resolve({
              data: null,
              error: null,
            })
          ),
        eq: jest.fn(() =>
            Promise.resolve({
              data: null,
              error: null,
            })
          ),
      }));
  
      const response = await request(app).post('/api/seatReservations/expire');
      expect(response.body.message).toBe('Abgelaufene Reservierungen erfolgreich freigegeben.');
      expect(response.status).toBe(200);
    });
  
    it('sollte eine 500 zurückgeben, wenn ein Fehler beim Freigeben auftritt', async () => {
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        update: jest.fn(() =>
          Promise.resolve({
            data: null,
            error: { message: 'Fehler beim Freigeben abgelaufener Reservierungen.' },
          })
        ),
        lt: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      }));
  
      const response = await request(app).post('/api/seatReservations/expire');
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Fehler beim Freigeben abgelaufener Reservierungen.');
    });
  });
  
  describe('POST /api/seatReservations/book', () => {
    it('sollte einen Sitzplatz erfolgreich buchen', async () => {
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        update: jest.fn(() =>
          Promise.resolve({
            data: null,
            error: null,
          })
        ),
        eq: jest.fn().mockReturnThis(),
      }));
  
      const response = await request(app)
        .post('/api/seatReservations/book')
        .send({ seat_id: 3, user_id: '1234' });
  
      expect(response.body.message).toBe('Sitzplatz erfolgreich gebucht');
      expect(response.status).toBe(200);
    });
  
    it('sollte eine 500 zurückgeben, wenn ein Fehler beim Buchen auftritt', async () => {
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        update: jest.fn(() =>
          Promise.resolve({
            data: null,
            error: { message: 'Fehler beim Buchen des Sitzplatzes' },
          })
        ),
        eq: jest.fn().mockReturnThis(),
      }));
  
      const response = await request(app)
        .post('/api/seatReservations/book')
        .send({ seat_id: 3, user_id: '1234' });
  
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Fehler beim Buchen des Sitzplatzes');
    });
  });
  
