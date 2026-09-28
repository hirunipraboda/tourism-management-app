export type AIWorkflowStep = 
  | 'Planning'
  | 'Researching'
  | 'Route Analysis'
  | 'Building Itinerary'
  | 'Validating'
  | 'Approval Required'
  | 'Approved';

export interface AIWorkflowStatus {
  id: string;
  tripId: string;
  tripTitle: string;
  destination: string;
  currentStep: AIWorkflowStep;
  progressPercent: number;
  agentName: string;
  confidenceScore: number;
  updatedAt: string;
  requiresHumanAction: boolean;
  notes?: string;
}

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'Idle' | 'Processing' | 'Requires Attention';
  tasksCompletedToday: number;
  accuracyRate: number;
  avatarIcon: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  type: 'Route Optimization' | 'Budget Efficiency' | 'Crowd Avoidance' | 'Weather Adjustment';
  description: string;
  impactScore: 'High' | 'Medium' | 'Low';
  destination: string;
  createdAt: string;
}
