const request = require('supertest');
const { app, main, insertMoviesIntoDatabase, movieExists, fetchPopularMovies, fetchMovies, fetchMovieDetails } = require('../../cineo_backend/server'); // Importiere die App
const Test = require('supertest/lib/test');


jest.mock('@supabase/supabase-js', () => {
  const mockClient = {
    from: jest.fn(() => ({
      select: jest.fn(),
      update: jest.fn(),
      eq: jest.fn(),
      in: jest.fn(),
      single: jest.fn(),
      deelte: jest.fn(),
    })),
  };
  return {
    createClient: jest.fn(() => mockClient),
  };
});

jest.mock('axios');

jest.mock('dotenv', () => ({
  config: jest.fn(() => {
    process.env.SUPABASE_URL = 'mock_url';
    process.env.SUPABASE_KEY = 'mock_key';
  }),
})); 

jest.mock('process', () => ({
  env: {
    SUPABASE_URL: 'https://bwtcquzpxgkrositnyrj.supabase.co',
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dGNxdXpweGdrcm9zaXRueXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxOTI5NTksImV4cCI6MjA0OTc2ODk1OX0.UYjPNnhS250d31KcmGfs6OJtpuwjaxbd3bebeOZJw9o',
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  process.env.SUPABASE_URL = 'https://bwtcquzpxgkrositnyrj.supabase.co';
  process.env.SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dGNxdXpweGdrcm9zaXRueXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxOTI5NTksImV4cCI6MjA0OTc2ODk1OX0.UYjPNnhS250d31KcmGfs6OJtpuwjaxbd3bebeOZJw9o';
  const supabaseUrl = 'https://bwtcquzpxgkrositnyrj.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dGNxdXpweGdrcm9zaXRueXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxOTI5NTksImV4cCI6MjA0OTc2ODk1OX0.UYjPNnhS250d31KcmGfs6OJtpuwjaxbd3bebeOZJw9o';
  jest.mock('dotenv', () => ({
    config: jest.fn(() => {
      process.env.SUPABASE_URL = 'mock_url';
      process.env.SUPABASE_KEY = 'mock_key';
    }),
  })); 
  
  jest.mock('process', () => ({
    env: {
      SUPABASE_URL: 'https://bwtcquzpxgkrositnyrj.supabase.co',
      SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dGNxdXpweGdrcm9zaXRueXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxOTI5NTksImV4cCI6MjA0OTc2ODk1OX0.UYjPNnhS250d31KcmGfs6OJtpuwjaxbd3bebeOZJw9o',
    },
  }));
});

describe('Minimaler Test', () => {
  it('should assert that true is true', () => {
    expect(true).toBe(true);
  });
});

describe('Server Tests', () => {
  it('should load the homepage', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/html/);
  });

  it('should load the program page', async () => {
    const response = await request(app).get('/program');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/html/);
  });

  it('should handle static files correctly', async () => {
    const response = await request(app).get('/images/some-image.jpg');
    expect(response.status).toBe(404); // Da das Bild nicht existiert
  });

  it('should return 404 for an unknown route', async () => {
    const response = await request(app).get('/unknown-route');
    expect(response.status).toBe(404);
  });

  it('should include proper CORS headers', async () => {
    const response = await request(app).get('/');
    expect(response.headers['access-control-allow-origin']).toBe('*');
  });

  it('should export required functions', () => {
    // Überprüfen, ob die Funktionen korrekt exportiert wurden
    expect(main).toBeDefined();
    expect(insertMoviesIntoDatabase).toBeDefined();
    expect(movieExists).toBeDefined();
    expect(fetchPopularMovies).toBeDefined();
    expect(fetchMovies).toBeDefined();
    expect(fetchMovieDetails).toBeDefined();
  });
});