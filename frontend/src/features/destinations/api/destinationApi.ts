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