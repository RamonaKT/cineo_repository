const request = require('supertest');
const express = require('express');
const nock = require('nock');
const bodyParser = require('body-parser');
const routerCreateShowSeats = require('../../../cineo_backend/src/controller/createshowseatsController');

const app = express();
app.use(bodyParser.json());
app.use(routerCreateShowSeats);

// Supabase-Mock-Utility
const supabaseUrl = 'https://bwtcquzpxgkrositnyrj.supabase.co';
const supabaseTable = '/rest/v1/seat';

// Utility zum Mocken der Supabase-API
const setupSupabaseMocks = () => {
  nock.cleanAll(); // Alle alten Mocks entfernen

  // Mock: Sitzplätze erfolgreich abrufen
  nock(supabaseUrl)
    .get(supabaseTable)
    .query({ room_id: 101, show_id: null }) // Exakte Query-Übereinstimmung
    .reply(200, [
      { seat_id: 123, room_id: 101, row_id: 1, show_id: null },
      { seat_id: 124, room_id: 101, row_id: 1, show_id: null },
    ]);

  // Mock: Fehler beim Abrufen von Sitzplätzen
  nock(supabaseUrl)
    .get(supabaseTable)
    .query({ room_id: 999, show_id: null }) // Simulierter Fehlerfall
    .reply(500, { message: 'Fehler beim Abrufen der Sitzplätze' });

  // Mock: Keine Sitzplätze gefunden (404)
  nock(supabaseUrl)
    .get(supabaseTable)
    .query({ room_id: 101, show_id: null }) // Leere Antwort simulieren
    .reply(404, []);

  // Mock: Upsert erfolgreich
  nock(supabaseUrl)
    .post(supabaseTable)
    .reply(200, { message: 'Upsert erfolgreich' });

  // Mock: Fehler beim Upsert
  nock(supabaseUrl)
    .post(supabaseTable)
    .reply(503, { message: 'Fehler beim Upsert' });
};

describe('POST /create', () => {
  beforeEach(() => {
    setupSupabaseMocks();
  });

  afterAll(() => {
    nock.cleanAll();
      const recorded = nock.recorder.play();
  console.log('Nock Requests:', recorded);
  });

  it('sollte Sitzplätze erfolgreich erstellen', async () => {
    const response = await request(app)
      .post('/create')
      .send({ room_id: 101, show_id: 1 });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Sitzplätze erfolgreich erstellt.');
    expect(response.body.upsertData).toBeDefined();
  });

  it('sollte Fehler bei ungültigen Eingaben zurückgeben', async () => {
    const response = await request(app)
      .post('/create')
      .send({ room_id: 'invalid', show_id: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('room_id und show_id müssen gültige Zahlen sein.');
  });

  it('sollte Fehler zurückgeben, wenn keine Sitzplätze gefunden werden', async () => {
    const response = await request(app)
      .post('/create')
      .send({ room_id: 101, show_id: 1 });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Keine Sitzplätze zum Erstellen gefunden.');
  });

  it('sollte Fehler zurückgeben, wenn Supabase einen Fehler ausgibt', async () => {
    const response = await request(app)
      .post('/create')
      .send({ room_id: 999, show_id: 1 }); // Simuliert Fehlerfall

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Fehler beim Abrufen der Sitzplätze.');
  });

  it('sollte Fehler beim Upsert zurückgeben', async () => {
    const response = await request(app)
      .post('/create')
      .send({ room_id: 101, show_id: 1 });

    expect(response.status).toBe(503);
    expect(response.body.error).toBe('Fehler beim Upsert der Sitzplätze.');
  });
});
