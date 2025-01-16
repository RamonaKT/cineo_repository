// Mock für Supabase
const createClient = jest.fn().mockReturnValue({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockResolvedValue({
    data: [
      {
        seat_id: 1,
        created_at: '2025-01-16T12:00:00+00:00',
        room_id: 1,
        row_id: 3,
        category: 0,
        status: 1,
        show_id: 1,
        reserved_at: null,
      },
      {
        seat_id: 2,
        created_at: '2025-01-16T12:05:00+00:00',
        room_id: 1,
        row_id: 3,
        category: 1,
        status: 0,
        show_id: 1,
        reserved_at: null,
      },
    ],
  }),
  insert: jest.fn().mockResolvedValue({
    data: [
      {
        seat_id: 3,
        created_at: '2025-01-16T12:10:00+00:00',
        room_id: 1,
        row_id: 4,
        category: 1,
        status: 1,
        show_id: 2,
        reserved_at: null,
      },
    ],
  }),
  update: jest.fn().mockResolvedValue({
    data: [
      {
        seat_id: 1,
        status: 0,
      },
    ],
  }),
});

module.exports = { createClient };
