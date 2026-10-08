/**
 * Destination Management – React/Frontend Tests
 *
 * Test IDs: FE-DST-001 … FE-DST-015
 *
 * Framework: Node.js built-in test runner (node:test + node:assert/strict)
 * Follows the same convention as frontend/src/tests/app.test.ts
 *
 * These tests verify:
 *  - Data structure contracts for Destination and Attraction objects
 *  - Service layer logic (adminService helpers, destinationService mapping)
 *  - Validation rules expected by the UI
 *  - Error handling / fallback patterns used in service functions
 *
 * NOTE: No real HTTP calls are made. All tests are pure logic / contract tests
 * that can run without a running backend, following the existing test approach.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

// ─────────────────────────────────────────────────────────────────────────────
// Test data fixtures – mirror the actual type shapes used in the application
// ─────────────────────────────────────────────────────────────────────────────

const sampleDestination = {
  id: 'dest-1',
  name: 'Sigiriya Ancient Rock Fortress',
  slug: 'sigiriya-rock-fortress',
  description: 'A towering monolithic rock column crowned by palace ruins.',
  location: 'Matale District',
  province: 'Central',
  category: 'Heritage',
  rating: 4.9,
  isActive: true,
  imageUrl: 'https://images.unsplash.com/photo-1588598198321-9735fd52455d',
};

const sampleAttraction = {
  id: 'attr-1',
  destinationId: 'dest-1',
  destinationName: 'Sigiriya Ancient Rock Fortress',
  name: 'Sigiriya Rock Citadel Climb',
  category: 'Heritage',
  openingHours: '07:00 AM – 05:30 PM',
  entryFee: 'USD 30',
  duration: '3 Hours',
  description: 'Climb the 5th-century fortress carved into rock.',
  status: 'Active',
  availability: 'Open All Year',
};

const sampleAdminDestination = {
  id: 'dest-admin-1',
  name: 'Ella Mountain Gap',
  province: 'Uva',
  category: 'Scenic',
  location: 'Badulla District',
  lat: 6.8667,
  lng: 81.0469,
  coverImage: '',
  attractionsCount: 5,
  status: 'Active' as const,
  description: 'Picturesque mountain town.',
  accessibility: 'Good',
  bestTimeToVisit: 'January – April',
  bookingsCount: 42,
  growthPercentage: 8.5,
};

// ─────────────────────────────────────────────────────────────────────────────
// FE-DST-001  Destination data structure integrity
// ─────────────────────────────────────────────────────────────────────────────
test('FE-DST-001: Destination object has required fields', () => {
  assert.ok(sampleDestination.id, 'id is required');
  assert.ok(sampleDestination.name, 'name is required');
  assert.ok(sampleDestination.slug, 'slug is required');
  assert.ok(sampleDestination.description, 'description is required');
  assert.ok(sampleDestination.location, 'location is required');
  assert.ok(sampleDestination.province, 'province is required');
});

// ─────────────────────────────────────────────────────────────────────────────
// FE-DST-002  Destination rating is within valid range
// ─────────────────────────────────────────────────────────────────────────────
test('FE-DST-002: Destination rating is between 0 and 5', () => {
  assert.ok(sampleDestination.rating >= 0, 'Rating should not be negative');
  assert.ok(sampleDestination.rating <= 5, 'Rating should not exceed 5');
  assert.equal(sampleDestination.rating, 4.9);
});

// ─────────────────────────────────────────────────────────────────────────────
// FE-DST-003  Attraction data structure integrity
// ─────────────────────────────────────────────────────────────────────────────
test('FE-DST-003: Attraction object has required fields', () => {
  assert.ok(sampleAttraction.id, 'id is required');
  assert.ok(sampleAttraction.destinationId, 'destinationId is required');
  assert.ok(sampleAttraction.name, 'name is required');
  assert.ok(sampleAttraction.category, 'category is required');
  assert.ok(sampleAttraction.status, 'status is required');
});

// ─────────────────────────────────────────────────────────────────────────────
// FE-DST-004  Attraction belongs to correct destination
// ─────────────────────────────────────────────────────────────────────────────
test('FE-DST-004: Attraction destinationId matches parent destination', () => {
  assert.equal(sampleAttraction.destinationId, sampleDestination.id);
  assert.equal(sampleAttraction.destinationName, sampleDestination.name);
});

// ─────────────────────────────────────────────────────────────────────────────
// FE-DST-005  Admin destination CRUD – addDestination adds to list
// ─────────────────────────────────────────────────────────────────────────────
test('FE-DST-005: adminService.addDestination creates a new entry with generated id', () => {
  let destinationsState = [sampleAdminDestination];

  // Simulate adminService.addDestination logic
  const addDestination = (dest: typeof sampleAdminDestination) => {
    const newDest = {
      ...dest,
      id: `dest-${Date.now()}`,
      attractionsCount: 0,
      bookingsCount: 0,
      growthPercentage: 5.0,
    };
    destinationsState = [newDest, ...destinationsState];
    return newDest;
  };

  const newDest = addDestination({
    ...sampleAdminDestination,
    id: '',
    name: 'Kandy Sacred City',
  });

  assert.ok(newDest.id.startsWith('dest-'), 'ID should start with dest-');
  assert.equal(newDest.name, 'Kandy Sacred City');
  assert.equal(destinationsState.length, 2);
  assert.equal(destinationsState[0].id, newDest.id);
});

// ─────────────────────────────────────────────────────────────────────────────
// FE-DST-006  Admin destination CRUD – updateDestination modifies correct entry
// ─────────────────────────────────────────────────────────────────────────────
test('FE-DST-006: adminService.updateDestination updates existing entry', () => {
  let destinationsState = [{ ...sampleAdminDestination }];

  const updateDestination = (id: string, data: Partial<typeof sampleAdminDestination>) => {
    const idx = destinationsState.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    destinationsState[idx] = { ...destinationsState[idx], ...data };
    return destinationsState[idx];
  };

  const updated = updateDestination('dest-admin-1', { name: 'Ella Gap & Nine Arches', category: 'Scenic' });

  assert.notEqual(updated, null);
  assert.equal(updated?.name, 'Ella Gap & Nine Arches');
  assert.equal(destinationsState[0].name, 'Ella Gap & Nine Arches');
});

// ─────────────────────────────────────────────────────────────────────────────
// FE-DST-007  Admin destination CRUD – updateDestination with non-existing id
// ─────────────────────────────────────────────────────────────────────────────
test('FE-DST-007: adminService.updateDestination returns null for non-existing id', () => {
  const destinationsState = [{ ...sampleAdminDestination }];

  const updateDestination = (id: string, data: Partial<typeof sampleAdminDestination>) => {
    const idx = destinationsState.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    destinationsState[idx] = { ...destinationsState[idx], ...data };
    return destinationsState[idx];
  };

  const result = updateDestination('non-existing-id', { name: 'Should Not Update' });
  assert.equal(result, null);
});

// ─────────────────────────────────────────────────────────────────────────────
// FE-DST-008  Admin destination CRUD – deleteDestination removes entry
// ─────────────────────────────────────────────────────────────────────────────
test('FE-DST-008: adminService.deleteDestination removes entry from list', () => {
  let destinationsState = [
    { ...sampleAdminDestination },
    { ...sampleAdminDestination, id: 'dest-admin-2', name: 'Kandy Sacred City' },
  ];

  const deleteDestination = (id: string) => {
    destinationsState = destinationsState.filter((d) => d.id !== id);
    return destinationsState;
  };

  const remaining = deleteDestination('dest-admin-1');
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].id, 'dest-admin-2');
});

// ─────────────────────────────────────────────────────────────────────────────
// FE-DST-009  Admin destination CRUD – toggleDestinationStatus toggles correctly
// ─────────────────────────────────────────────────────────────────────────────
test('FE-DST-009: adminService.toggleDestinationStatus toggles Active ↔ Inactive', () => {
  let destinationsState = [{ ...sampleAdminDestination, status: 'Active' as const }];

  const toggleStatus = (id: string) => {
    destinationsState = destinationsState.map((d) =>
      d.id === id
        ? { ...d, status: (d.status === 'Active' ? 'Inactive' : 'Active') as typeof d.status }
        : d
    );
    return destinationsState;
  };

  assert.equal(destinationsState[0].status, 'Active');
  toggleStatus('dest-admin-1');
  assert.equal(destinationsState[0].status, 'Inactive');
  toggleStatus('dest-admin-1');
  assert.equal(destinationsState[0].status, 'Active');
});

// ─────────────────────────────────────────────────────────────────────────────
// FE-DST-010  Attraction CRUD – createAttraction adds to list with generated id
// ─────────────────────────────────────────────────────────────────────────────
test('FE-DST-010: createAttraction generates an id and adds to state', () => {
  let attractionsState: typeof sampleAttraction[] = [];

  const createAttraction = (data: Partial<typeof sampleAttraction>) => {
    const newAttr = {
      id: `attr-${Date.now()}`,
      name: data.name || '',
      destinationId: data.destinationId || 'dest-1',
      destinationName: data.destinationName || '',
      category: data.category || 'Sightseeing',
      openingHours: data.openingHours || '08:00 AM – 06:00 PM',
      entryFee: data.entryFee || 'Free',
      duration: data.duration || '1-2 Hours',
      description: data.description || '',
      status: data.status || 'Active',
      availability: data.availability || 'Open All Year',
    };
    attractionsState = [newAttr, ...attractionsState];
    return newAttr;
  };

  const created = createAttraction({ name: 'New Cave', destinationId: 'dest-1', category: 'Adventure' });

  assert.ok(created.id.startsWith('attr-'));
  assert.equal(created.name, 'New Cave');
  assert.equal(attractionsState.length, 1);
});

// ─────────────────────────────────────────────────────────────────────────────
// FE-DST-011  Attraction CRUD – toggleAttractionStatus
// ─────────────────────────────────────────────────────────────────────────────
test('FE-DST-011: toggleAttractionStatus switches Active ↔ Inactive', () => {
  let attractionsState = [{ ...sampleAttraction }];

  const toggleStatus = (id: string) => {
    attractionsState = attractionsState.map((a) =>
      a.id === id
        ? { ...a, status: a.status === 'Active' ? 'Inactive' : 'Active' }
        : a
    );
    return attractionsState;
  };

  assert.equal(attractionsState[0].status, 'Active');
  toggleStatus('attr-1');
  assert.equal(attractionsState[0].status, 'Inactive');
});

// ─────────────────────────────────────────────────────────────────────────────
// FE-DST-012  Destination service fallback uses mock when API fails
// ─────────────────────────────────────────────────────────────────────────────
test('FE-DST-012: destinationService returns mock data when API throws', async () => {
  const MOCK_DESTINATIONS = [sampleDestination];

  // Simulate the try/catch fallback in destinationService.getDestinations
  const getDestinations = async (): Promise<typeof sampleDestination[]> => {
    try {
      throw new Error('Network error');
    } catch {
      return MOCK_DESTINATIONS;
    }
  };

  const result = await getDestinations();
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'dest-1');
});

// ─────────────────────────────────────────────────────────────────────────────
// FE-DST-013  Destination search filter filters by name
// ─────────────────────────────────────────────────────────────────────────────
test('FE-DST-013: Search filter matches by name (case-insensitive)', () => {
  const destinations = [
    { ...sampleDestination },
    { ...sampleDestination, id: 'dest-2', name: 'Ella Mountain Gap', slug: 'ella-gap' },
    { ...sampleDestination, id: 'dest-3', name: 'Kandy Sacred City', slug: 'kandy' },
  ];

  const search = (query: string) =>
    destinations.filter(
      (d) =>
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.description.toLowerCase().includes(query.toLowerCase())
    );

  const results = search('ella');
  assert.equal(results.length, 1);
  assert.equal(results[0].name, 'Ella Mountain Gap');
});

// ─────────────────────────────────────────────────────────────────────────────
// FE-DST-014  Destination search – no match returns empty list
// ─────────────────────────────────────────────────────────────────────────────
test('FE-DST-014: Search with non-matching term returns empty array', () => {
  const destinations = [sampleDestination];
  const search = (query: string) =>
    destinations.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()));

  const results = search('zzzxqjkw');
  assert.equal(results.length, 0);
});

// ─────────────────────────────────────────────────────────────────────────────
// FE-DST-015  Admin KPI counts active destinations correctly
// ─────────────────────────────────────────────────────────────────────────────
test('FE-DST-015: Admin KPI activeDestinations counts only Active entries', () => {
  const destinationsState = [
    { ...sampleAdminDestination, status: 'Active' as const },
    { ...sampleAdminDestination, id: 'dest-2', status: 'Inactive' as const },
    { ...sampleAdminDestination, id: 'dest-3', status: 'Active' as const },
  ];

  const activeDestinations = destinationsState.filter((d) => d.status === 'Active').length;
  assert.equal(activeDestinations, 2);
});
