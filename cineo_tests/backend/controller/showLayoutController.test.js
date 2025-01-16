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
const routerLayout = require('../../../cineo_backend/src/controller/showLayoutController');

// Mock-Datenbankinitialisierung
const supabase = createClient();
supabase.from.mockImplementation((table) => {
  if (table === 'rooms') {
    return {
      select: jest.fn().mockResolvedValue({
        data: [
          { room_id: 999, created_at: '2025-01-16', capacity: 50 }, 
        ],
        error: null,
      }),
      upsert: jest.fn().mockResolvedValue({
        data: [{ room_id: 999, created_at: '2025-01-16', capacity: 50 }],
        error: null,
      }),
    };
  }

  if (table === 'rows') {
    return {
      select: jest.fn().mockResolvedValue({
        data: [
          { row_id: 999, created_at: '2025-01-16', seat_count: 10, room_id: 999, row_number: 1 }, 
          { row_id: 1000, created_at: '2025-01-16', seat_count: 12, room_id: 999, row_number: 2 },
        ],
        error: null,
      }),
      upsert: jest.fn().mockResolvedValue({
        data: [
          { row_id: 999, created_at: '2025-01-16', seat_count: 10, room_id: 999, row_number: 1 },
          { row_id: 1000, created_at: '2025-01-16', seat_count: 12, room_id: 999, row_number: 2 },
        ],
        error: null,
      }),
    };
  }

  if (table === 'seat') {
    return {
      select: jest.fn().mockResolvedValue({
        data: [
          { seat_id: 999, created_at: '2025-01-16', room_id: 999, row_id: 999, category: 1, status: 0, show_id: 1, seat_number: 1, reserved_at: null, reserved_by: null },
          { seat_id: 1000, created_at: '2025-01-16', room_id: 999, row_id: 999, category: 2, status: 1, show_id: 1, seat_number: 2, reserved_at: '2025-01-16', reserved_by: '123' },
        ],
        error: null,
      }),
      upsert: jest.fn().mockResolvedValue({
        data: [
          { seat_id: 999, created_at: '2025-01-16', room_id: 999, row_id: 999, category: 1, status: 0, show_id: 1, seat_number: 1, reserved_at: null, reserved_by: null },
          { seat_id: 1000, created_at: '2025-01-16', room_id: 999, row_id: 999, category: 2, status: 1, show_id: 1, seat_number: 2, reserved_at: '2025-01-16', reserved_by: '123' },
        ],
        error: null,
      }),
    };
  }

  return {
    select: jest.fn().mockResolvedValue({ data: null, error: 'Datenbankfehler' }), // Fehler für andere Tabellen
    upsert: jest.fn().mockResolvedValue({ data: null, error: 'Fehler beim Speichern' }),
  };
});

let app;
beforeEach(() => {
  jest.clearAllMocks();  // Mocks zurücksetzen, um keine Daten aus vorherigen Tests zu übernehmen
  app = express();
  app.use(express.json());
  app.use('/api/saveLayout', routerLayout);
});

describe('POST /api/saveLayout/save', () => {
    it('sollte erfolgreich ein Layout speichern', async () => {
      const requestData = {
        roomNumber: 999,
        seatCounts: [3, 2, 3],  // Beispiel-Sitzanzahlen
        seatsData: [
          [{ category: 1, status: 0 }, { category: 2, status: 1 }, { category: 3, status: 0 }],
          [{ category: 1, status: 1 }, { category: 2, status: 0 }],
          [{ category: 1, status: 0 }, { category: 2, status: 1 }, { category: 3, status: 0 }],
        ], // Beispiel-Sitzdaten
      };
  
      const response = await request(app)
        .post('/api/saveLayout/save')
        .send(requestData);
  
      // Überprüfen, ob die Antwort erfolgreich ist
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Layout erfolgreich gespeichert');
      expect(response.body.status).toBe('success');
    });
  
    it('sollte einen Fehler zurückgeben, wenn die Raumnummer ungültig ist', async () => {
      const requestData = {
        roomNumber: -1,  // Ungültige Raumnummer
        seatCounts: [2, 2, 2],
        seatsData: [
          [{ category: 1, status: 0 }, { category: 2, status: 1 }],
          [{ category: 1, status: 0 }, { category: 2, status: 1 }],
          [{ category: 1, status: 0 }, { category: 2, status: 1 }],
        ],
      };
  
      const response = await request(app)
        .post('/api/saveLayout/save')
        .send(requestData);
  
      // Überprüfen, ob die Antwort den Fehlerstatus 400 zurückgibt
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Ungültige Raumnummer.');
    });
  
    it('sollte einen Fehler zurückgeben, wenn seatCounts ungültig ist', async () => {
      const requestData = {
        roomNumber: 999,
        seatCounts: [],  // Ungültige Sitzanzahl
        seatsData: [
          [{ category: 1, status: 0 }, { category: 2, status: 1 }],
          [{ category: 1, status: 0 }, { category: 2, status: 1 }],
          [{ category: 1, status: 0 }, { category: 2, status: 1 }],
        ],
      };
  
      const response = await request(app)
        .post('/api/saveLayout/save')
        .send(requestData);
  
      // Überprüfen, ob die Antwort den Fehlerstatus 400 zurückgibt
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Ungültige Sitzanzahl.');
    });
  
    it('sollte einen Fehler zurückgeben, wenn seatData nicht den Anforderungen entspricht', async () => {
      const requestData = {
        roomNumber: 999,
        seatCounts: [10, 20, 30],
        seatsData: [  // Ungültige Sitzdaten
          [{ category: 1, status: 0 }],
          [{ category: 1, status: 0 }],
        ],
      };
  
      const response = await request(app)
        .post('/api/saveLayout/save')
        .send(requestData);
  
      // Überprüfen, ob die Antwort den Fehlerstatus 400 zurückgibt
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Ungültige Sitzdaten.');
    });
  
    it('sollte einen Fehler zurückgeben, wenn beim Speichern des Layouts ein Fehler auftritt', async () => {
      // Mock für Fehler beim Upsert
      supabase.from.mockImplementationOnce(() => ({
        upsert: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Fehler beim Speichern des Layouts' },
        }),
      }));
  
      const requestData = {
        roomNumber: 999,
        seatCounts: [2, 2, 2],
        seatsData: [
          [{ category: 1, status: 0 }, { category: 2, status: 1 }],
          [{ category: 1, status: 0 }, { category: 2, status: 1 }],
          [{ category: 1, status: 0 }, { category: 2, status: 1 }],
        ],
      };
  
      const response = await request(app)
        .post('/api/saveLayout/save')
        .send(requestData);
  
      // Überprüfen, ob die Antwort den Fehlerstatus 500 zurückgibt
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Fehler beim Speichern des Layouts');
    });
});