// add.test.js
const add = require('../../cineo_backend/add');  // Importiere die Funktion aus add.js

test('adds 1 + 2 to equal 3', () => {
  expect(add(1, 2)).toBe(3);
});

test('adds -1 + -1 to equal -2', () => {
  expect(add(-1, -1)).toBe(-2);
});

test('adds 0 + 0 to equal 0', () => {
  expect(add(0, 0)).toBe(0);
});

test('adds 100 + 200 to equal 300', () => {
  expect(add(100, 200)).toBe(300);
});
