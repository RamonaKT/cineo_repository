const request = require('supertest'); // HTTP-Anfragen in Tests
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

// Supabase-Client mocken
jest.mock('@supabase/supabase-js', () => {
  const mockClient = {
    from: jest.fn(() => ({
      select: jest.fn(),
      upsert: jest.fn(),
    })),
  };
  return {
    createClient: jest.fn(() => mockClient),
  };
});

// Route importieren (relativer Pfad)
const routerCreateShowSeats = require('../../../cineo_backend/src/controller/createshowseatsController');


// Mock-Datenbankinitialisierung
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

let app;
beforeEach(() => {
  jest.clearAllMocks();  // Mocks zurücksetzen, um keine Daten aus vorherigen Tests zu übernehmen
  app = express();
  app.use(express.json());
  app.use('/api/sitzplaetzeErstellen', routerCreateShowSeats);
});

describe('POST /api/sitzplaetzeErstellen/create', () => {
  it('sollte Sitzplätze erfolgreich erstellen', async () => {
    const response = await request(app)
      .post('/api/sitzplaetzeErstellen/create')
      .send({
        room_id: 999,
        show_id: 999,
      });

    // Überprüfen, ob die Antwort erfolgreich ist
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Sitzplätze erfolgreich erstellt.');

    // Überprüfen, ob die Rückgabedaten korrekt sind
    expect(response.body.upsertData).toEqual([
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
    ]);
  });

  it('sollte einen Fehler zurückgeben, wenn room_id oder show_id ungültig ist', async () => {
    const response = await request(app)
      .post('/api/sitzplaetzeErstellen/create')
      .send({
        room_id: 'ungültig',
        show_id: 999,
      });

    // Überprüfen, ob die Antwort einen Fehler zurückgibt
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('room_id und show_id müssen gültige Zahlen sein.');
  });

  it('sollte einen Fehler zurückgeben, wenn keine Sitzplätze verfügbar sind', async () => {
    // Mock leere Sitzplatzdaten
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

    const response = await request(app)
      .post('/api/sitzplaetzeErstellen/create')
      .send({
        room_id: 999,
        show_id: 999,
      });

    // Überprüfen, ob die Antwort keine Sitzplätze findet
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Keine Sitzplätze zum Erstellen gefunden.');
  });

  it('sollte einen Fehler zurückgeben, wenn die Datenbank beim Abrufen der Sitzplätze fehlschlägt', async () => {
    // Mock für Fehler beim Abrufen der Sitzplätze
    supabase.from.mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn(() =>
        Promise.resolve({
          data: null,
          error: { message: 'Datenbankfehler beim Abrufen der Sitzplätze' },
        })
      ),
    }));
  
    const response = await request(app)
      .post('/api/sitzplaetzeErstellen/create')
      .send({
        room_id: 999,
        show_id: 999,
      });
  
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Fehler beim Abrufen der Sitzplätze.');
  });

  it('sollte einen Fehler zurückgeben, wenn room_id oder show_id fehlt', async () => {
    const response = await request(app)
      .post('/api/sitzplaetzeErstellen/create')
      .send({
        room_id: 999, // show_id fehlt
      });
  
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('room_id und show_id müssen gültige Zahlen sein.');
  });
  
  it('sollte einen Fehler zurückgeben, wenn beide Parameter fehlen', async () => {
    const response = await request(app)
      .post('/api/sitzplaetzeErstellen/create')
      .send({});
  
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('room_id und show_id müssen gültige Zahlen sein.');
  });
  
  it('sollte einen Fehler zurückgeben, wenn ein unerwarteter Fehler auftritt', async () => {
    // Simuliere einen unerwarteten Fehler
    supabase.from.mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn(() => Promise.reject(new Error('Unerwarteter Fehler'))),
    }));
  
    const response = await request(app)
      .post('/api/sitzplaetzeErstellen/create')
      .send({
        room_id: 999,
        show_id: 999,
      });
  
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Fehler beim Erstellen oder Updaten der Sitzplätze.');
  });

  it('sollte einen Fehler zurückgeben, wenn keine Sitzplätze verfügbar sind', async () => {
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
  
    const response = await request(app)
      .post('/api/sitzplaetzeErstellen/create')
      .send({
        room_id: 999,
        show_id: 999,
      });
  
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Keine Sitzplätze zum Erstellen gefunden.');
  });
  
});
