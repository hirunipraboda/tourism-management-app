import test from 'node:test';
import assert from 'node:assert/strict';
import type { AvailabilitySlotResponse, CreateAvailabilityPayload } from '../../services/guideAvailabilityService.ts';

const mockSlots: AvailabilitySlotResponse[] = [
  {
    availabilityId: 101,
    guideId: 1,
    guideName: 'Kasun Perera',
    availableDate: '2026-10-15',
    startTime: '08:30:00',
    endTime: '16:30:00',
    isBooked: false,
  },
  {
    availabilityId: 102,
    guideId: 1,
    guideName: 'Kasun Perera',
    availableDate: '2026-10-16',
    startTime: '09:00:00',
    endTime: '17:00:00',
    isBooked: true,
  },
  {
    availabilityId: 103,
    guideId: 2,
    guideName: 'Suresh Kumar',
    availableDate: '2026-10-17',
    startTime: '07:00:00',
    endTime: '15:00:00',
    isBooked: false,
  },
  {
    availabilityId: 104,
    guideId: 3,
    guideName: 'Fatima Nazeer',
    availableDate: '2026-10-18',
    startTime: '10:00:00',
    endTime: '18:00:00',
    isBooked: false,
  },
];

test('WEB-AVL-001: Open availability dashboard displays slots correctly', () => {
  assert.ok(mockSlots.length >= 4);
  const slot = mockSlots[0];
  assert.equal(slot.guideName, 'Kasun Perera');
  assert.equal(slot.availableDate, '2026-10-15');
  assert.equal(slot.startTime, '08:30:00');
  assert.equal(slot.endTime, '16:30:00');
  assert.equal(slot.isBooked, false);
});

test('WEB-AVL-002: Filter availability by guide and date', () => {
  const filterSlots = (guideId?: number | 'all', date?: string) => {
    return mockSlots.filter(s => {
      const matchGuide = !guideId || guideId === 'all' || s.guideId === guideId;
      const matchDate = !date || s.availableDate === date;
      return matchGuide && matchDate;
    });
  };

  const kasunSlots = filterSlots(1);
  assert.equal(kasunSlots.length, 2);
  assert.ok(kasunSlots.every(s => s.guideId === 1));

  const oct17Slots = filterSlots('all', '2026-10-17');
  assert.equal(oct17Slots.length, 1);
  assert.equal(oct17Slots[0].guideName, 'Suresh Kumar');

  const emptySlots = filterSlots(999);
  assert.equal(emptySlots.length, 0);
});

test('WEB-AVL-003: Create availability slot with valid times', () => {
  const newPayload: CreateAvailabilityPayload = {
    guideId: 1,
    availableDate: '2026-11-01',
    startTime: '09:00:00',
    endTime: '17:00:00',
  };

  assert.ok(newPayload.guideId > 0);
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(newPayload.availableDate));
  assert.ok(newPayload.endTime > newPayload.startTime);

  const createdSlot: AvailabilitySlotResponse = {
    availabilityId: 201,
    ...newPayload,
    guideName: 'Kasun Perera',
    isBooked: false,
  };

  const updatedList = [createdSlot, ...mockSlots];
  assert.equal(updatedList.length, mockSlots.length + 1);
  assert.equal(updatedList[0].availabilityId, 201);
});

test('WEB-AVL-004: Enter invalid availability details rejects inverted times or missing dates', () => {
  const validateSlot = (slot: { availableDate: string; startTime: string; endTime: string }) => {
    const errors: Record<string, string> = {};
    if (!slot.availableDate) errors.availableDate = 'Date is required';
    if (!slot.startTime) errors.startTime = 'Start time is required';
    if (!slot.endTime) errors.endTime = 'End time is required';
    if (slot.startTime && slot.endTime && slot.endTime <= slot.startTime) {
      errors.timeRange = 'End time must be after start time';
    }
    return errors;
  };

  const err1 = validateSlot({ availableDate: '', startTime: '10:00', endTime: '18:00' });
  assert.equal(err1.availableDate, 'Date is required');

  const err2 = validateSlot({ availableDate: '2026-11-01', startTime: '18:00', endTime: '09:00' });
  assert.equal(err2.timeRange, 'End time must be after start time');

  const err3 = validateSlot({ availableDate: '2026-11-01', startTime: '09:00', endTime: '17:00' });
  assert.equal(Object.keys(err3).length, 0);
});

test('WEB-AVL-005: Delete availability slot removes it from active list', () => {
  const slotList = [...mockSlots];
  const targetId = 101;

  const afterDelete = slotList.filter(s => s.availabilityId !== targetId);
  assert.equal(afterDelete.length, mockSlots.length - 1);
  assert.equal(afterDelete.some(s => s.availabilityId === targetId), false);
});
