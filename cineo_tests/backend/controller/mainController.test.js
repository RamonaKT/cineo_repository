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
        supabase.from.mockImplementationOnce(() => ({
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
        supabase.from.mockImplementationOnce(() => ({
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
        supabase.from.mockImplementationOnce(() => ({
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
        supabase.from.mockImplementationOnce(() => ({
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
        supabase.from.mockImplementationOnce(() => ({
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
        supabase.from.mockImplementationOnce(() => ({
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
        supabase.from.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(() =>
                Promise.resolve({
                    data: { duration: 120 },
                    error: null,
                })
            ),
        }));
        supabase.from.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            filter: jest.fn().mockReturnThis(),
            then: jest.fn((cb) => cb({
                data: [{ room_id: 1, time: '12:00', end_time: '14:00' }],
                error: null,
            })),
        }));
        supabase.from.mockImplementationOnce(() => ({
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
        supabase.from.mockImplementationOnce(() => ({
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


describe('POST /tickets', () => {
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
  
      const response = await request(app).post('/api/tickets').send({
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
  
    it('soll 400 zurückgeben, wenn Daten fehlen', async () => {
      const response = await request(app).post('/api/tickets').send({
        ticket_type: 'Standard',
        price: 12,
      });
  
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Fehlende Ticketdaten' });
    });
  
    it('soll 400 zurückgeben, wenn Kapazität überschritten wird', async () => {
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({ data: { room_id: 1 }, error: null }),
      }));
  
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({ data: { capacity: 1 }, error: null }),
      }));
  
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({ data: [{ ticket_id: 1 }], error: null }),
      }));
  
      const response = await request(app).post('/api/tickets').send({
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
  
      const response = await request(app).post('/api/tickets').send({
        show_id: 1,
        ticket_type: 'Standard',
        price: 12,
      });
  
      expect(response.status).toBe(500);
    });
  });

  describe('GET /tickets', () => {
    it('soll die Tickets des Benutzers erfolgreich zurückgeben', async () => {
        supabase.from.mockImplementationOnce(() => ({
            select: jest.fn().mockResolvedValueOnce({
              data: [
                {
                  ticket_id: 1,
                  show_id: 101,
                  ticket_type: 'Standard',
                  price: 15.99,
                  discount_name: 'SummerSale',
                },
              ], 
              error: null,
            }),
            eq: jest.fn().mockReturnThis(),
          }));
  
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: [{ show_id: 1, movie_title: 'Film A', room_id: 1, date: '2023-01-01', time: '18:00' }],
          error: null,
        }),
      }));
  
      const response = await request(app).get('/api/tickets').query({ email: 'test@example.com' });
  
      expect(response.status).toBe(200);
    });
  
    it('soll 400 zurückgeben, wenn die E-Mail fehlt', async () => {
      const response = await request(app).get('/api/tickets');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'E-Mail wird benötigt' });
    });
  
    it('soll 500 zurückgeben, wenn ein Fehler auftritt', async () => {
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockRejectedValue(new Error('Datenbankfehler')),
      }));
  
      const response = await request(app).get('/api/tickets').query({ email: 'test@example.com' });
  
      expect(response.status).toBe(500);
    });
  });

  describe('POST /register', () => {
    it('soll erfolgreich registrieren', async () => {
      supabase.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }),
      }));
  
      const response = await request(app).post('/api/register').send({
        email: 'test@example.com',
        password: 'password123',
      });
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Registration successful!' });
    });
  
    it('soll 400 zurückgeben, wenn Daten fehlen', async () => {
      const response = await request(app).post('/api/register').send({
        email: 'test@example.com',
      });
  
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Alle Felder müssen ausgefüllt werden.' });
    });
  
    it('soll 500 zurückgeben, wenn ein Fehler auftritt', async () => {
      supabase.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockRejectedValue(new Error('Einfügefehler')),
      }));
  
      const response = await request(app).post('/api/register').send({
        email: 'test@example.com',
        password: 'password123',
      });
  
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Einfügefehler' });
    });
  });

  describe('POST /login', () => {
    it('soll erfolgreich einloggen', async () => {
      // Mock für supabase ausführen
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValueOnce({
          data: [{ email: 'test@cineo.com', password: 'password123' }], // Erfolgreiche Benutzerdaten
          error: null,
        }),
        eq: jest.fn().mockReturnThis(),
      }));
  
      const response = await request(app).post('/api/login').send({
        email: 'test@cineo.com',
        password: 'password123',
      });
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Login successful!',
        role: 'employee',  // Weil die E-Mail nicht mit @cineo.com endet
      });
    });
  
    it('soll 400 zurückgeben, wenn Felder fehlen', async () => {
      const response = await request(app).post('/api/login').send({
        email: 'test@example.com',
      });
  
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Alle Felder müssen ausgefüllt werden.' });
    });
  
    it('soll 401 zurückgeben, wenn ungültige Zugangsdaten', async () => {
      // Mock für supabase ausführen
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValueOnce({
          data: null,
          error: null,
        }),
        eq: jest.fn().mockReturnThis(),
      }));
  
      const response = await request(app).post('/api/login').send({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });
  
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Ungültige Zugangsdaten.' });
    });
  
    it('soll 400 zurückgeben, wenn ein Fehler auftritt', async () => {
      // Mock für supabase Fehler
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValueOnce({
          data: null,
          error: {message: 'Datenbankfehler'},
        }),
        eq: jest.fn().mockReturnThis(),
      }));
  
      const response = await request(app).post('/api/login').send({
        email: 'test@example.com',
        password: 'password123',
      });
  
      expect(response.status).toBe(400);
    });
  });

  describe('POST /guest', () => {
    it('soll für gültige E-Mail erfolgreich einloggen', async () => {
      const response = await request(app).post('/api/guest').send({
        email: 'guest@example.com',
      });
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Guest login successful!' });
    });
  
    it('soll 400 zurückgeben, wenn E-Mail Format ungültig ist', async () => {
      const response = await request(app).post('/api/guest').send({
        email: 'invalid-email',
      });
  
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Ungültiges E-Mail Format.' });
    });
  
    it('soll 400 zurückgeben, wenn keine E-Mail übergeben wird', async () => {
      const response = await request(app).post('/api/guest').send({});
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Ungültiges E-Mail Format.' });
    });
  });

  describe('GET /iban', () => {
    it('soll die IBAN für die gegebene E-Mail zurückgeben', async () => {
      // Mock für supabase ausführen
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: { iban: 'DE1234567890' },
          error: null,
        }),
        eq: jest.fn().mockReturnThis(),
      }));
  
      const response = await request(app).get('/api/iban').query({ email: 'test@example.com' });
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ iban: 'DE1234567890' });
    });
  
    it('soll 400 zurückgeben, wenn keine E-Mail übergeben wird', async () => {
      const response = await request(app).get('/api/iban').query({});
  
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'E-Mail wird benötigt' });
    });
  
    it('soll 500 zurückgeben, wenn ein Fehler beim Abrufen der IBAN auftritt', async () => {
      // Mock für Supabase-Fehler
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: 'Fehler beim Abrufen',
        }),
        eq: jest.fn().mockReturnThis(),
      }));
  
      const response = await request(app).get('/api/iban').query({ email: 'test@example.com' });
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Fehler beim Abrufen der IBAN' });
    });
  });

  describe('POST /iban', () => {
    it('soll IBAN erfolgreich speichern', async () => {
      // Mock für Supabase-Update
      supabase.from.mockImplementationOnce(() => ({
        update: jest.fn().mockResolvedValue({
          error: null,
        }),
        eq: jest.fn().mockReturnThis(),
      }));
  
      const response = await request(app).post('/api/iban').send({
        email: 'test@example.com',
        iban: 'DE1234567890',
      });
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'IBAN erfolgreich gespeichert' });
    });
  
    it('soll 400 zurückgeben, wenn E-Mail oder IBAN fehlt', async () => {
      const response = await request(app).post('/api/iban').send({
        email: 'test@example.com',
      });
  
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'E-Mail und IBAN sind erforderlich' });
    });
  
    it('soll 500 zurückgeben, wenn ein Fehler beim Speichern der IBAN auftritt', async () => {
      // Mock für Supabase-Fehler
      supabase.from.mockImplementationOnce(() => ({
        update: jest.fn().mockResolvedValue({
          error: 'Fehler beim Speichern',
        }),
        eq: jest.fn().mockReturnThis(),
      }));
  
      const response = await request(app).post('/api/iban').send({
        email: 'test@example.com',
        iban: 'DE1234567890',
      });
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Fehler beim Speichern der IBAN' });
    });
  });

  describe('GET /ticketpreise', () => {
    it('soll Ticketpreise und Rabatte erfolgreich zurückgeben', async () => {
      // Mock für supabase Abruf der Ticketpreise
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: [
            { ticket_id: 1, ticket_price: 10, ticket_name: 'Standard' },
            { ticket_id: 2, ticket_price: 15, ticket_name: 'Premium' },
          ],
          error: null,
        }),
      }));
  
      // Mock für supabase Abruf der Rabatte
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: [
            { name: 'Sommer Rabatt', type: 'percentage', value: 20 },
            { name: 'Winter Rabatt', type: 'fixed', value: 5 },
          ],
          error: null,
        }),
      }));
  
      const response = await request(app).get('/api/ticketpreise');
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ticketpreise: [
          { ticket_id: 1, ticket_price: 10, ticket_name: 'Standard' },
          { ticket_id: 2, ticket_price: 15, ticket_name: 'Premium' },
        ],
        rabatte: [
          { name: 'Sommer Rabatt', type: 'percentage', value: 20 },
          { name: 'Winter Rabatt', type: 'fixed', value: 5 },
        ],
      });
    });
  
    it('soll 500 zurückgeben, wenn ein Fehler bei der Abfrage der Ticketpreise auftritt', async () => {
      // Mock für Supabase-Fehler bei den Ticketpreisen
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: 'Fehler bei den Ticketpreisen',
        }),
      }));
  
      const response = await request(app).get('/api/ticketpreise');
  
      expect(response.status).toBe(500);
    });
  
    it('soll 500 zurückgeben, wenn ein Fehler bei der Abfrage der Rabatte auftritt', async () => {
      // Mock für Supabase-Fehler bei den Rabatten
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: [
            { ticket_id: 1, ticket_price: 10, ticket_name: 'Standard' },
          ],
          error: null,
        }),
      }));
  
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: 'Fehler bei den Rabatten',
        }),
      }));
  
      const response = await request(app).get('/api/ticketpreise');
  
      expect(response.status).toBe(500);
    });
});
  
describe('DELETE /ticketrabatt/:name', () => {
    it('soll den Rabatt erfolgreich löschen', async () => {
      // Mock für supabase delete
      supabase.from.mockImplementationOnce(() => ({
        delete: jest.fn().mockResolvedValue({
          error: null,
        }),
        eq: jest.fn().mockReturnThis(),
      }));
  
      const response = await request(app).delete('/api/ticketrabatt/BlackFriday');
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Rabatt mit dem Namen "BlackFriday" wurde gelöscht.' });
    });
  
    it('soll 500 zurückgeben, wenn ein Fehler beim Löschen des Rabatts auftritt', async () => {
      // Mock für Supabase-Fehler
      supabase.from.mockImplementationOnce(() => ({
        delete: jest.fn().mockResolvedValue({
          error: 'Fehler beim Löschen des Rabatts',
        }),
        eq: jest.fn().mockReturnThis(),
      }));
  
      const response = await request(app).delete('/api/ticketrabatt/BlackFriday');
  
      expect(response.status).toBe(500);
    });
  });

  describe('PUT /ticketpreise/:ticket_id', () => {
    it('soll den Ticketpreis erfolgreich aktualisieren', async () => {
      // Mock für supabase update
      supabase.from.mockImplementationOnce(() => ({
        update: jest.fn().mockResolvedValue({
          error: null,
        }),
      }));
  
      const response = await request(app).put('/api/ticketpreise/1').send({
        ticket_price: 20.00,
      });
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Ticketpreis aktualisiert' });
    });
  
    it('soll 500 zurückgeben, wenn ein Fehler beim Aktualisieren des Ticketpreises auftritt', async () => {
      // Mock für Supabase-Fehler
      supabase.from.mockImplementationOnce(() => ({
        update: jest.fn().mockResolvedValue({
          error: 'Fehler beim Aktualisieren des Ticketpreises',
        }),
      }));
  
      const response = await request(app).put('/api/ticketpreise/1').send({
        ticket_price: 20.00,
      });
  
      expect(response.status).toBe(500);
    });
  });

  describe('POST /ticketrabatt', () => {
    it('soll einen Rabatt erfolgreich hinzufügen', async () => {
      // Mock für supabase insert
      supabase.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      }));
  
      const response = await request(app).post('/api/ticketrabatt').send({
        name: 'BlackFriday',
        type: 'percentage',
        value: 20,
      });
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Rabatt hinzugefügt' });
    });
  
    it('soll 500 zurückgeben, wenn ein Fehler beim Hinzufügen des Rabatts auftritt', async () => {
      // Mock für Supabase-Fehler
      supabase.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockResolvedValue({
          error: 'Fehler beim Hinzufügen des Rabatts',
        }),
      }));
  
      const response = await request(app).post('/api/ticketrabatt').send({
        name: 'BlackFriday',
        type: 'percentage',
        value: 20,
      });
  
      expect(response.status).toBe(500);
    });
  });
  
