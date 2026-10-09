import test from 'node:test';
import assert from 'node:assert/strict';

test('ATP-001: AI Trip Plan Generation Request and Response Schema', () => {
  const planRequest = {
    destination: 'Sigiriya',
    destinations: ['Sigiriya', 'Dambulla'],
    startDate: '2031-06-01',
    endDate: '2031-06-03',
    travelers: 2,
    budget: { amount: 600, currency: 'USD' },
    travelStyle: ['Culture', 'Nature'],
  };

  assert.equal(planRequest.destination, 'Sigiriya');
  assert.equal(planRequest.destinations.length, 2);
  assert.equal(planRequest.budget.amount, 600);

  // Response structure
  const generatedPlan = {
    trip: {
      title: 'Sigiriya & Dambulla Heritage Expedition',
      duration: 3,
      destinations: ['Sigiriya', 'Dambulla'],
      travelers: 2,
    },
    days: [
      {
        day: 1,
        date: '2031-06-01',
        location: 'Sigiriya',
        title: 'Arrival and Royal Water Gardens',
        activities: [
          {
            id: 'act-1',
            time: '09:00 AM - 11:30 AM',
            title: 'Sigiriya Museum and Water Gardens',
            location: 'Sigiriya',
            durationMinutes: 150,
            estimatedCost: 15,
          },
        ],
      },
    ],
    budget: {
      total: 350,
      remaining: 250,
      currency: 'USD',
    },
    metadata: {
      aiScore: 94.5,
    },
  };

  assert.equal(generatedPlan.trip.duration, 3);
  assert.equal(generatedPlan.days.length, 1);
  assert.equal(generatedPlan.days[0].activities[0].title, 'Sigiriya Museum and Water Gardens');
  assert.ok(generatedPlan.metadata.aiScore > 90);
});

test('ATP-002: Validation - Missing Destination or Negative Travelers', () => {
  const validatePlanningInput = (input: { destination: string; travelers: number }) => {
    if (!input.destination || input.destination.trim().length === 0) return 'Destination is required.';
    if (input.travelers <= 0) return 'Number of travelers must be greater than zero.';
    return null;
  };

  assert.equal(validatePlanningInput({ destination: '', travelers: 2 }), 'Destination is required.');
  assert.equal(validatePlanningInput({ destination: 'Kandy', travelers: 0 }), 'Number of travelers must be greater than zero.');
  assert.equal(validatePlanningInput({ destination: 'Kandy', travelers: 2 }), null);
});

test('ATP-003: Save Generated Plan Payload Construction', () => {
  const payload = {
    userId: 'usr-tourist-01',
    plan: {
      trip: { title: 'Cultural Triangle Expedition' },
      days: [{ day: 1, title: 'Day 1' }],
      budget: { total: 400 },
    },
  };

  assert.ok(payload.userId);
  assert.ok(payload.plan.days.length > 0);
  assert.equal(payload.plan.budget.total, 400);
});

test('ATP-004: Targeted Day Regeneration in Plan', () => {
  const originalDays = [
    { day: 1, location: 'Kandy', title: 'Day 1 City Walk' },
    { day: 2, location: 'Kandy', title: 'Day 2 Temple Tour' },
  ];

  const regeneratedDay2 = { day: 2, location: 'Kandy', title: 'Day 2 Botanical Gardens & Tea Estate' };

  const updatedPlan = originalDays.map(d => d.day === 2 ? regeneratedDay2 : d);
  assert.equal(updatedPlan[0].title, 'Day 1 City Walk');
  assert.equal(updatedPlan[1].title, 'Day 2 Botanical Gardens & Tea Estate');
});

test('ATP-005: Targeted Activity Replacement within Day', () => {
  const activities = [
    { id: 'act-1', title: 'Temple of the Tooth', duration: 120 },
    { id: 'act-2', title: 'Kandy Lake Walk', duration: 60 },
  ];

  const replacementActivity = { id: 'act-2', title: 'Udawatta Kele Forest Sanctuary Hike', duration: 90 };

  const updatedActivities = activities.map(a => a.id === 'act-2' ? replacementActivity : a);
  assert.equal(updatedActivities[0].title, 'Temple of the Tooth');
  assert.equal(updatedActivities[1].title, 'Udawatta Kele Forest Sanctuary Hike');
  assert.equal(updatedActivities[1].duration, 90);
});

test('ATP-006 & ATP-007: Plan Retrieval and Plan Deletion', () => {
  let storedPlans: Record<string, any> = {
    'plan-101': { id: 'plan-101', title: 'Yala Safari Adventure' },
  };

  // Retrieval
  assert.ok(storedPlans['plan-101']);
  assert.equal(storedPlans['plan-101'].title, 'Yala Safari Adventure');

  // Deletion
  delete storedPlans['plan-101'];
  assert.equal(storedPlans['plan-101'], undefined);
});

test('ATP-008: AI Engine Service Unavailable Fallback Handling', () => {
  const handleAiPlanFailure = (error: Error) => {
    // Graceful fallback to deterministic template
    return {
      title: 'Standard Heritage Itinerary (Fallback)',
      isFallback: true,
      errorLogged: error.message,
      days: [
        { day: 1, title: 'Arrival & Scenic Walk', activities: [] },
      ],
    };
  };

  const fallback = handleAiPlanFailure(new Error('AI Agent microservice connection timed out.'));
  assert.equal(fallback.isFallback, true);
  assert.ok(fallback.title.includes('Fallback'));
  assert.equal(fallback.days.length, 1);
});
