const nock = require('nock');

// Mock für Supabase
module.exports.createClient = jest.fn().mockReturnValue({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  is: jest.fn().mockReturnThis(),
  upsert: jest.fn().mockReturnThis(),
});

// Mock für nock-Anfragen, die von Supabase verwendet werden
const mockSupabase = () => {
  // Mock für Supabase-POST (Abrufen von Sitzplätzen) - Erfolgreiche Antwort
  nock('https://bwtcquzpxgkrositnyrj.supabase.co')
    .post('/rest/v1/seat') // Verwenden von POST statt GET
    .reply(200, [
      {
        seat_id: 123456789012345,
        created_at: '2025-01-01T12:00:00Z',
        room_id: 101,
        row_id: 2,
        category: 0,
        status: 0,
        show_id: 1,
        seat_number: 7,
        reserved_at: null,
        reserved_by: null,
      },
      {
        seat_id: 123456789012346,
        created_at: '2025-01-01T12:00:00Z',
        room_id: 101,
        row_id: 2,
        category: 0,
        status: 0,
        show_id: 1,
        seat_number: 8,
        reserved_at: null,
        reserved_by: null,
      },
    ]);

  // Mock für Supabase-POST, um eine leere Liste zurückzugeben
  nock('https://bwtcquzpxgkrositnyrj.supabase.co')
    .post('/rest/v1/seat') // Verwenden von POST statt GET
    .reply(404, []); // Leere Antwort für keine Sitzplätze gefunden

  // Mock für Supabase-Fehler (Fehler beim Abrufen der Daten)
  nock('https://bwtcquzpxgkrositnyrj.supabase.co')
    .post('/rest/v1/seat') // Verwenden von POST statt GET
    .reply(500, { message: 'Supabase-Fehler' }); // Fehler simulieren
};

module.exports.mockSupabase = mockSupabase;
