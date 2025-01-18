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
  

