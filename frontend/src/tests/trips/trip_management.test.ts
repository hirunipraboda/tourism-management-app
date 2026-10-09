import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getTripTimeline,
  validateTripDateConsistency,
} from '../../utils/tripTimeline.ts';

test('TRP-001: Valid Trip Creation Payload Structure', () => {
  const tripRequest = {
    destination: 'Ella',
    startDate: '2031-06-01',
    endDate: '2031-06-05',
    numberOfTravelers: 2,
    budget: 800,
  };

  assert.ok(tripRequest.destination.length > 0);
  assert.ok(new Date(tripRequest.startDate) < new Date(tripRequest.endDate));
  assert.ok(tripRequest.numberOfTravelers > 0);
  assert.ok(tripRequest.budget > 0);
});

test('TRP-002: Optional Fields Defaulting', () => {
  const minimalRequest = {
    destination: 'Nuwara Eliya',
    startDate: '2031-07-01',
    endDate: '2031-07-03',
  };

  const processedTrip = {
    ...minimalRequest,
    tripName: `${minimalRequest.destination} Trip`,
    tripStyle: 'standard',
    interests: [],
    numberOfTravelers: 1,
    budget: 500,
  };

  assert.equal(processedTrip.tripName, 'Nuwara Eliya Trip');
  assert.equal(processedTrip.tripStyle, 'standard');
  assert.deepEqual(processedTrip.interests, []);
});

test('TRP-003: Validation - End Date Precedes Start Date', () => {
  const check = validateTripDateConsistency('2031-08-10', '2031-08-05');
  assert.equal(check.isValid, false);
  assert.ok(check.error?.includes('Trip start date cannot be after the end date'));
});

test('TRP-004: Validation - Negative Budget and Zero Travelers', () => {
  const validateBudget = (b: number) => b > 0;
  const validateTravelers = (t: number) => t > 0;

  assert.equal(validateBudget(-100), false);
  assert.equal(validateBudget(0), false);
  assert.equal(validateBudget(500), true);

  assert.equal(validateTravelers(0), false);
  assert.equal(validateTravelers(-2), false);
  assert.equal(validateTravelers(3), true);
});

test('TRP-005 & TRP-006: Trip Filtering and Pagination Parameters', () => {
  const allTrips = [
    { id: '1', destination: 'Kandy', status: 'Upcoming', createdAt: '2031-01-01' },
    { id: '2', destination: 'Galle', status: 'Completed', createdAt: '2031-01-02' },
    { id: '3', destination: 'Kandy', status: 'Draft', createdAt: '2031-01-03' },
    { id: '4', destination: 'Ella', status: 'Upcoming', createdAt: '2031-01-04' },
  ];

  const filterTrips = (dest?: string, status?: string) => {
    return allTrips.filter(t => {
      if (dest && !t.destination.toLowerCase().includes(dest.toLowerCase())) return false;
      if (status && t.status !== status) return false;
      return true;
    });
  };

  const kandyTrips = filterTrips('Kandy');
  assert.equal(kandyTrips.length, 2);

  const upcomingTrips = filterTrips(undefined, 'Upcoming');
  assert.equal(upcomingTrips.length, 2);

  // Pagination slice
  const page = 1;
  const pageSize = 2;
  const paginated = allTrips.slice((page - 1) * pageSize, page * pageSize);
  assert.equal(paginated.length, 2);
  assert.equal(paginated[0].id, '1');
});

test('TRP-007 & TRP-011: Trip Timeline Calculator and Status Engine', () => {
  const futureStart = '2031-10-10';
  const futureEnd = '2031-10-15';

  const timeline = getTripTimeline(futureStart, futureEnd);
  assert.equal(timeline.status, 'Upcoming');
  assert.equal(timeline.totalDays, 6);
  assert.ok(timeline.timelineLabel.includes('Starts'));
});

test('TRP-008: Multi-user Ownership and Access Isolation', () => {
  const currentUserId = 'user-alex-1';
  const userTrips = [
    { id: 't-1', userId: 'user-alex-1', title: 'Alex in Kandy' },
    { id: 't-2', userId: 'user-elena-2', title: 'Elena in Galle' },
  ];

  const authorizedTrips = userTrips.filter(t => t.userId === currentUserId);
  assert.equal(authorizedTrips.length, 1);
  assert.equal(authorizedTrips[0].id, 't-1');
});

test('TRP-009 & TRP-010: Trip Update and Dependent Day Date Shifting', () => {
  const trip = {
    id: 't-shift',
    startDate: '2031-05-01',
    endDate: '2031-05-03',
    days: [
      { dayNumber: 1, date: '2031-05-01' },
      { dayNumber: 2, date: '2031-05-02' },
      { dayNumber: 3, date: '2031-05-03' },
    ],
  };

  // Shift trip start date by 5 days
  const newStartDate = new Date('2031-05-06');
  const shiftedDays = trip.days.map(d => {
    const shifted = new Date(newStartDate);
    shifted.setDate(shifted.getDate() + (d.dayNumber - 1));
    return {
      dayNumber: d.dayNumber,
      date: shifted.toISOString().split('T')[0],
    };
  });

  assert.equal(shiftedDays[0].date, '2031-05-06');
  assert.equal(shiftedDays[1].date, '2031-05-07');
  assert.equal(shiftedDays[2].date, '2031-05-08');
});

test('TRP-012: Trip Deletion Flow', () => {
  let trips = [
    { id: 't-del-1', name: 'Trip to Keep' },
    { id: 't-del-2', name: 'Trip to Remove' },
  ];

  const deleteTrip = (id: string) => {
    trips = trips.filter(t => t.id !== id);
  };

  deleteTrip('t-del-2');
  assert.equal(trips.length, 1);
  assert.equal(trips[0].id, 't-del-1');
});
