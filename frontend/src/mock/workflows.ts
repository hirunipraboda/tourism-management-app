import { AIWorkflowStatus, AIAgent, AIRecommendation } from '../types/ai';

export const MOCK_AI_WORKFLOWS: AIWorkflowStatus[] = [
  {
    id: 'wf-301',
    tripId: 'trip-903',
    tripTitle: 'Cliffside Hideaways & Limoncello Crafting',
    destination: 'Amalfi Coastal Route',
    currentStep: 'Approval Required',
    progressPercent: 85,
    agentName: 'Route Optimization Engine v4.2',
    confidenceScore: 0.94,
    updatedAt: '10 mins ago',
    requiresHumanAction: true,
    notes: 'Private yacht charter timing requires operator approval due to sea swell advisory.',
  },
  {
    id: 'wf-302',
    tripId: 'trip-901',
    tripTitle: 'Autumn Zen & Culinary Pilgrimage',
    destination: 'Kyoto Ancient Sanctuaries',
    currentStep: 'Approved',
    progressPercent: 100,
    agentName: 'Cultural Itinerary Synthesizer',
    confidenceScore: 0.99,
    updatedAt: '2 hours ago',
    requiresHumanAction: false,
    notes: 'All reservations, Tea Master vouchers, and local guide slots confirmed.',
  },
  {
    id: 'wf-303',
    tripId: 'trip-902',
    tripTitle: 'Alpine High Trails & Panorama Rail',
    destination: 'Swiss Alpine Horizons',
    currentStep: 'Validating',
    progressPercent: 70,
    agentName: 'Alpine Transit & Weather Validator',
    confidenceScore: 0.92,
    updatedAt: '25 mins ago',
    requiresHumanAction: false,
    notes: 'Checking cable car maintenance windows for Mount Titlis section.',
  },
];

export const MOCK_AGENTS: AIAgent[] = [
  {
    id: 'agent-1',
    name: 'Atlas Route Planner',
    role: 'Multi-modal transit & geographical sequence optimization',
    status: 'Processing',
    tasksCompletedToday: 142,
    accuracyRate: 99.4,
    avatarIcon: 'Route',
  },
  {
    id: 'agent-2',
    name: 'Aetheria Concierge',
    role: 'Personalized attraction matching & cultural pacing',
    status: 'Active',
    tasksCompletedToday: 210,
    accuracyRate: 98.7,
    avatarIcon: 'Sparkles',
  },
  {
    id: 'agent-3',
    name: 'Sentinel Guard',
    role: 'Real-time weather, crowd density & safety constraint validation',
    status: 'Requires Attention',
    tasksCompletedToday: 89,
    accuracyRate: 97.9,
    avatarIcon: 'ShieldAlert',
  },
];

export const MOCK_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: 'rec-1',
    title: 'Swap Day 3 Afternoon Activity in Kyoto',
    type: 'Crowd Avoidance',
    description: 'Predicted 340% increase in tourist density at Fushimi Inari between 2 PM - 5 PM. Recommend morning shift at 7:30 AM.',
    impactScore: 'High',
    destination: 'Kyoto',
    createdAt: '15 mins ago',
  },
  {
    id: 'rec-2',
    title: 'Swiss Pass Glacier Express Seat Upgrade',
    type: 'Budget Efficiency',
    description: 'First class Upgrade available at $45/person with complimentary panorama lounge meal package.',
    impactScore: 'Medium',
    destination: 'Swiss Alps',
    createdAt: '1 hour ago',
  },
];
