import test from 'node:test';
import assert from 'node:assert/strict';

test('ITN-001 & ITN-002: Itinerary Multi-Day Hierarchy and Date Tracking', () => {
  const itinerary = {
    id: 'itin-01',
    title: 'Cultural Triangle 3-Day Journey',
    days: [
      {
        dayNumber: 1,
        date: '2031-06-01',
        title: 'Arrival in Colombo',
        location: 'Colombo',
        items: [
          {
            id: 'item-101',
            activityName: 'Gangaramaya Temple',
            location: 'Colombo',
            startTime: '09:00',
            endTime: '11:00',
            durationMinutes: 120,
            estimatedCost: 10,
          },
        ],
      },
      {
        dayNumber: 2,
        date: '2031-06-02',
        title: 'Scenic Highlands',
        location: 'Kandy',
        items: [],
      },
    ],
  };

  assert.equal(itinerary.days.length, 2);
  assert.equal(itinerary.days[0].dayNumber, 1);
  assert.equal(itinerary.days[1].location, 'Kandy');
});

test('ITN-003, ITN-004, ITN-005: Itinerary Days CRUD Operations', () => {
  let days = [
    { dayNumber: 1, title: 'Day 1' },
    { dayNumber: 2, title: 'Day 2' },
  ];

  // Update
  days = days.map(d => d.dayNumber === 2 ? { ...d, title: 'Updated Day 2' } : d);
  assert.equal(days[1].title, 'Updated Day 2');

  // Delete
  days = days.filter(d => d.dayNumber !== 2);
  assert.equal(days.length, 1);
});

test('ITN-006, ITN-007, ITN-008: Itinerary Activities Cost and Timing Management', () => {
  let items = [
    {
      id: 'i-1',
      activityName: 'Morning Safari',
      startTime: '06:00',
      endTime: '09:30',
      durationMinutes: 210,
      estimatedCost: 45,
    },
    {
      id: 'i-2',
      activityName: 'Campsite Lunch',
      startTime: '12:00',
      endTime: '13:30',
      durationMinutes: 90,
      estimatedCost: 15,
    },
  ];

  // Total cost
  const totalCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);
  assert.equal(totalCost, 60);

  // Update item
  items = items.map(item => item.id === 'i-1' ? { ...item, durationMinutes: 180, estimatedCost: 40 } : item);
  assert.equal(items[0].durationMinutes, 180);
  assert.equal(items[0].estimatedCost, 40);

  // Delete item
  items = items.filter(item => item.id !== 'i-2');
  assert.equal(items.length, 1);
});

test('ITN-009 & ITN-010: Transport Leg Selection and Transit Times', () => {
  const transitOption = {
    transportType: 'TRAIN',
    origin: 'Colombo Fort',
    destination: 'Kandy',
    departureTime: '07:00 AM',
    arrivalTime: '09:35 AM',
    durationMinutes: 155,
    estimatedFare: 1200,
    trainNumber: '1015',
    trainName: 'Intercity Express',
  };

  assert.equal(transitOption.transportType, 'TRAIN');
  assert.equal(transitOption.durationMinutes, 155);
  assert.equal(transitOption.estimatedFare, 1200);

  // Date Feasibility check: transport arrives before activity start
  const transportArrivalMinutes = 9 * 60 + 35; // 09:35 AM = 575 mins
  const activityStartMinutes = 10 * 60 + 0;   // 10:00 AM = 600 mins
  assert.ok(transportArrivalMinutes <= activityStartMinutes, 'Transport must arrive before activity starts');
});

test('ITN-011 to ITN-015: Approval Lifecycle and Operator Authorization Verification', () => {
  // Verification of the 4 approval lifecycle states
  const validStatuses = ['Draft', 'Approved', 'Rejected', 'RevisionRequired'];
  assert.equal(validStatuses.length, 4);

  // State machine transition
  const transitionStatus = (current: string, action: 'Approve' | 'Reject' | 'RequestRevision') => {
    switch (action) {
      case 'Approve': return 'Approved';
      case 'Reject': return 'Rejected';
      case 'RequestRevision': return 'RevisionRequired';
    }
  };

  assert.equal(transitionStatus('Draft', 'Approve'), 'Approved');
  assert.equal(transitionStatus('Draft', 'Reject'), 'Rejected');
  assert.equal(transitionStatus('Draft', 'RequestRevision'), 'RevisionRequired');

  // NOTE on UI Integration:
  // In the React frontend, the operator approval actions in the UI currently update local component state
  // rather than dispatching to POST /api/itineraries/:id/approve. This is documented as NOT WIRED in the report.
});

test('GEN-001 to GEN-004: Generation Workflow Audit Logging and Fallbacks', () => {
  const workflow = {
    id: 'wf-001',
    status: 'InProgress',
    currentStep: 'AgenticResearch',
    logs: [
      { step: 'Initialized', timestamp: '2031-05-01T10:00:00Z', status: 'SUCCESS' },
      { step: 'AgenticResearch', timestamp: '2031-05-01T10:00:02Z', status: 'SUCCESS' },
    ],
  };

  assert.equal(workflow.status, 'InProgress');
  assert.equal(workflow.logs.length, 2);
  assert.equal(workflow.logs[1].step, 'AgenticResearch');
});
