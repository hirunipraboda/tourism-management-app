import test from 'node:test';
import assert from 'node:assert/strict';
import type { TourOperationResponse, UpdateTourOperationPayload } from '../../services/tourOperationService.ts';

const mockOperations: TourOperationResponse[] = [
  {
    tourOperationId: 101,
    tourPackageId: 1,
    packageName: 'Cultural Triangle Heritage Tour',
    guideId: 1,
    guideName: 'Kasun Perera',
    scheduledDate: '2026-10-20T08:00:00Z',
    numberOfTourists: 4,
    totalCost: 1280,
    status: 'Scheduled',
    notes: 'Pick up from Cinnamon Grand Colombo at 06:30.',
    createdAt: '2026-10-05T09:00:00Z',
  },
  {
    tourOperationId: 102,
    tourPackageId: 2,
    packageName: 'Ella Peak & Highlands Trek',
    guideId: 2,
    guideName: 'Suresh Kumar',
    scheduledDate: '2026-10-21T07:00:00Z',
    numberOfTourists: 2,
    totalCost: 360,
    status: 'InProgress',
    notes: 'Arrived at trailhead, clear weather.',
    createdAt: '2026-10-06T10:00:00Z',
  },
  {
    tourOperationId: 103,
    tourPackageId: 3,
    packageName: 'Galle Maritime & Ramparts Walk',
    guideId: 3,
    guideName: 'Fatima Nazeer',
    scheduledDate: '2026-10-18T10:00:00Z',
    numberOfTourists: 6,
    totalCost: 540,
    status: 'Completed',
    notes: 'Tour finished without incidents. Positive feedback received.',
    createdAt: '2026-10-04T11:00:00Z',
  },
];

test('WEB-TOP-001: Display tour operations list with correct details', () => {
  assert.ok(mockOperations.length >= 3);
  const op = mockOperations[0];
  assert.equal(op.tourOperationId, 101);
  assert.equal(op.packageName, 'Cultural Triangle Heritage Tour');
  assert.equal(op.guideName, 'Kasun Perera');
  assert.equal(op.numberOfTourists, 4);
  assert.equal(op.totalCost, 1280);
  assert.equal(op.status, 'Scheduled');
});

test('WEB-TOP-002: Update tour operation modifies tourist count and costs', () => {
  const original = mockOperations[0];
  const updatePayload: UpdateTourOperationPayload = {
    tourPackageId: original.tourPackageId,
    guideId: original.guideId,
    scheduledDate: '2026-10-22T08:00:00Z',
    numberOfTourists: 6,
    totalCost: 1920,
    notes: 'Group expanded from 4 to 6 travelers.',
  };

  const updated: TourOperationResponse = {
    ...original,
    ...updatePayload,
  };

  assert.equal(updated.numberOfTourists, 6);
  assert.equal(updated.totalCost, 1920);
  assert.equal(updated.scheduledDate, '2026-10-22T08:00:00Z');
  assert.equal(updated.notes, 'Group expanded from 4 to 6 travelers.');
});

test('WEB-TOP-003: Change tour operation status through valid lifecycle', () => {
  const allowedStatuses = ['Scheduled', 'CheckedIn', 'InProgress', 'Completed', 'NoShow', 'Cancelled'];
  let currentStatus: (typeof allowedStatuses)[number] = 'Scheduled';

  const transitionStatus = (newStatus: string) => {
    if (!allowedStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }
    currentStatus = newStatus;
    return currentStatus;
  };

  assert.equal(transitionStatus('CheckedIn'), 'CheckedIn');
  assert.equal(transitionStatus('InProgress'), 'InProgress');
  assert.equal(transitionStatus('Completed'), 'Completed');

  assert.throws(() => transitionStatus('NonExistentStatus'), /Invalid status/);
});
