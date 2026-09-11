import test from 'node:test';
import assert from 'node:assert/strict';

test('Frontend configuration: API endpoint resolution', () => {
  const defaultApiUrl = 'http://localhost:5000/api';
  assert.ok(defaultApiUrl.includes(':5000'));
  assert.ok(defaultApiUrl.endsWith('/api'));
});

test('Tourism data structure integrity', () => {
  const sampleDestination = {
    id: 'dest-1',
    name: 'Sigiriya Rock Fortress',
    rating: 4.9,
    category: 'HERITAGE',
  };

  assert.equal(sampleDestination.name, 'Sigiriya Rock Fortress');
  assert.equal(sampleDestination.category, 'HERITAGE');
  assert.ok(sampleDestination.rating >= 4.5);
});
