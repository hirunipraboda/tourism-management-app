const BASE_URL = 'http://localhost:5123/api';

export interface Attraction {
  id: string;
  destinationId: string;
  name: string;
  category: string;
  openingHours?: string;
  entryFee?: number;
  visitDurationMinutes?: number;
  latitude?: number;
  longitude?: number;
  isAccessible: boolean;
  createdAt: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  city: string;
  description?: string;
  createdAt: string;
  attractions?: Attraction[];
}

export interface CreateDestinationInput {
  name: string;
  country: string;
  city: string;
  description?: string;
}

export async function getDestinations(): Promise<Destination[]> {
  const res = await fetch(`${BASE_URL}/destinations`);
  if (!res.ok) throw new Error('Failed to fetch destinations');
  return res.json();
}

export async function getDestination(id: string): Promise<Destination> {
  const res = await fetch(`${BASE_URL}/destinations/${id}`);
  if (!res.ok) throw new Error('Failed to fetch destination');
  return res.json();
}

export async function createDestination(data: CreateDestinationInput): Promise<Destination> {
  const res = await fetch(`${BASE_URL}/destinations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create destination');
  return res.json();
}

export async function deleteDestination(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/destinations/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete destination');
}

export interface CreateAttractionInput {
  destinationId: string;
  name: string;
  category: string;
  openingHours?: string;
  entryFee?: number;
}

export async function createAttraction(data: CreateAttractionInput): Promise<Attraction> {
  const res = await fetch(`${BASE_URL}/attractions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create attraction');
  return res.json();
}

// ===================================================================
// AI LangGraph Service Integration API Types & Functions
// ===================================================================

export interface UserPreferences {
  userBudget: number;
  maxDurationHours: number;
  categories: string[];
  requireAccessible: boolean;
  notes?: string;
}

export interface CurateAttractionsInput {
  threadId?: string;
  destinationId: string;
  destinationName: string;
  preferences: UserPreferences;
}

export interface HumanApprovalInput {
  threadId: string;
  decision: 'APPROVE' | 'REJECT' | 'REVISE';
  feedback?: string;
}

export interface CuratedAttraction {
  name: string;
  category: string;
  openingHours?: string;
  entryFee?: number;
  visitDurationMinutes?: number;
  latitude?: number;
  longitude?: number;
  isAccessible: boolean;
  rationale?: string;
  scheduledTime?: string;
}

export interface ValidationResult {
  isValid: boolean;
  budgetPass: boolean;
  durationPass: boolean;
  accessibilityPass: boolean;
  checkedRules: string[];
  errorMessages: string[];
}

export interface ReasoningLogEntry {
  step: string;
  description: string;
  outputSummary: string;
}

export interface AttractionAiState {
  threadId: string;
  destinationId: string;
  destinationName: string;
  status: string;
  iterationCount: number;
  curatedPlan: CuratedAttraction[];
  validationResult: ValidationResult;
  reasoningLog: ReasoningLogEntry[];
  humanDecision?: string;
  humanFeedback?: string;
}

export async function curateAttractions(data: CurateAttractionsInput): Promise<AttractionAiState> {
  const res = await fetch(`${BASE_URL}/attractions/ai/curate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to curate attractions with AI service');
  return res.json();
}

export async function submitHumanApproval(data: HumanApprovalInput): Promise<AttractionAiState> {
  const res = await fetch(`${BASE_URL}/attractions/ai/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit human approval to AI service');
  return res.json();
}

export async function getAiStateStatus(threadId: string): Promise<AttractionAiState> {
  const res = await fetch(`${BASE_URL}/attractions/ai/status/${threadId}`);
  if (!res.ok) throw new Error('Failed to fetch AI state status');
  return res.json();
}

export async function saveApprovedAttractions(threadId: string): Promise<Attraction[]> {
  const res = await fetch(`${BASE_URL}/attractions/ai/save-approved/${threadId}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to save approved attractions');
  return res.json();
}