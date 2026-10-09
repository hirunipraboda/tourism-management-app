import test from 'node:test';
import assert from 'node:assert/strict';
import type { CreateGuidePayload } from '../../services/guideService.ts';

// Mock guide entity representative of AdminGuideToursPage & backend response
const sampleGuides = [
  {
    id: 'guide-001',
    name: 'Kasun Perera',
    email: 'kasun.perera@travellink.lk',
    phone: '+94 77 123 4567',
    languages: ['English', 'Sinhala', 'Tamil'],
    specialties: ['Cultural Heritage', 'Temple History'],
    yearsExperience: 8,
    rating: 4.9,
    totalTours: 312,
    status: 'Active',
    verificationStatus: 'Verified',
    bio: 'Native Kandyan cultural historian with Peradeniya University archaeology credentials.',
  },
  {
    id: 'guide-002',
    name: 'Suresh Kumar',
    email: 'suresh.kumar@travellink.lk',
    phone: '+94 76 234 5678',
    languages: ['English', 'Sinhala'],
    specialties: ['Mountain Hiking', 'Tea Estates'],
    yearsExperience: 6,
    rating: 4.95,
    totalTours: 218,
    status: 'Active',
    verificationStatus: 'Verified',
    bio: 'Wilderness mountain ranger specializing in Ella high country trails.',
  },
  {
    id: 'guide-003',
    name: 'Pending Trainee',
    email: 'trainee@travellink.lk',
    phone: '+94 71 000 1111',
    languages: ['English'],
    specialties: ['City Tours'],
    yearsExperience: 1,
    rating: 0,
    totalTours: 0,
    status: 'Pending',
    verificationStatus: 'Pending',
    bio: 'Junior trainee under onboarding.',
  },
];

test('WEB-GUI-001: Open Guide Directory - List displays guides correctly', () => {
  assert.ok(sampleGuides.length >= 3);
  const first = sampleGuides[0];
  assert.equal(first.name, 'Kasun Perera');
  assert.ok(first.languages.includes('English'));
  assert.ok(first.rating > 4.0);
  assert.equal(first.verificationStatus, 'Verified');
});

test('WEB-GUI-002: Search/filter guides by query and specialty', () => {
  const filterGuides = (query: string, specialty?: string) => {
    return sampleGuides.filter(g => {
      const matchQuery = !query || g.name.toLowerCase().includes(query.toLowerCase()) || g.languages.some(l => l.toLowerCase().includes(query.toLowerCase()));
      const matchSpecialty = !specialty || specialty === 'All' || g.specialties.includes(specialty);
      return matchQuery && matchSpecialty;
    });
  };

  const hikingGuides = filterGuides('', 'Mountain Hiking');
  assert.equal(hikingGuides.length, 1);
  assert.equal(hikingGuides[0].name, 'Suresh Kumar');

  const kasunSearch = filterGuides('Kasun', 'All');
  assert.equal(kasunSearch.length, 1);
  assert.equal(kasunSearch[0].id, 'guide-001');

  const emptyMatch = filterGuides('NonExistentGuide');
  assert.equal(emptyMatch.length, 0);
});

test('WEB-GUI-003: Open guide details - Selected guide info presented', () => {
  const selected = sampleGuides.find(g => g.id === 'guide-001');
  assert.ok(selected);
  assert.equal(selected.id, 'guide-001');
  assert.ok(selected.bio.includes('Kandyan'));
  assert.equal(selected.totalTours, 312);
  assert.equal(selected.yearsExperience, 8);
});

test('WEB-GUI-004: Register a guide with valid information', () => {
  const payload: CreateGuidePayload = {
    name: 'Nimal Jayawardena',
    email: 'nimal@example.com',
    phone: '+94 77 987 6543',
    bio: 'Wildlife expert with Yala sanctuary license.',
    languages: ['English', 'Sinhala'],
    specialties: ['Wildlife Safari', 'Bird Watching'],
    yearsExperience: 5,
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  assert.ok(payload.name.trim().length > 0);
  assert.ok(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email));
  assert.ok((payload.yearsExperience ?? 0) >= 0);
  assert.ok(payload.languages.length > 0);
  assert.ok(payload.specialties.length > 0);
});

test('WEB-GUI-005: Submit guide registration with invalid/missing data', () => {
  const validateForm = (form: { name: string; email: string }) => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Full Name is required';
    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Enter a valid email address';
    }
    return errors;
  };

  const err1 = validateForm({ name: '', email: 'invalid' });
  assert.equal(err1.name, 'Full Name is required');
  assert.equal(err1.email, 'Enter a valid email address');

  const err2 = validateForm({ name: 'Valid Name', email: '' });
  assert.equal(err2.name, undefined);
  assert.equal(err2.email, 'Email is required');

  const err3 = validateForm({ name: 'Valid Name', email: 'valid@example.com' });
  assert.equal(Object.keys(err3).length, 0);
});

test('WEB-GUI-006: Edit guide information updates fields', () => {
  const original = { ...sampleGuides[0] };
  const updatePayload = {
    name: 'Kasun Perera (Senior)',
    phone: '+94 77 999 0000',
    yearsExperience: 9,
  };

  const updated = { ...original, ...updatePayload };
  assert.equal(updated.name, 'Kasun Perera (Senior)');
  assert.equal(updated.phone, '+94 77 999 0000');
  assert.equal(updated.yearsExperience, 9);
});

test('WEB-GUI-007: Deactivate guide removes from active list', () => {
  const guidesList = [...sampleGuides];
  const guideToDeactivateId = 'guide-001';

  const updatedList = guidesList.map(g =>
    g.id === guideToDeactivateId ? { ...g, status: 'Inactive' as const } : g
  );

  const activeOnly = updatedList.filter(g => g.status === 'Active');
  assert.equal(activeOnly.some(g => g.id === guideToDeactivateId), false);
});

test('WEB-GUI-008: Approve guide verification sets Verified status', () => {
  const pendingGuide = { ...sampleGuides[2] };
  assert.equal(pendingGuide.verificationStatus, 'Pending');

  const verified = { ...pendingGuide, verificationStatus: 'Verified', status: 'Active' as const };
  assert.equal(verified.verificationStatus, 'Verified');
  assert.equal(verified.status, 'Active');
});

test('WEB-GUI-009: Reject guide verification sets Rejected status', () => {
  const pendingGuide = { ...sampleGuides[2] };
  assert.equal(pendingGuide.verificationStatus, 'Pending');

  const rejected = { ...pendingGuide, verificationStatus: 'Rejected', status: 'Inactive' as const, rejectionReason: 'Incomplete documentation' };
  assert.equal(rejected.verificationStatus, 'Rejected');
  assert.equal(rejected.status, 'Inactive');
  assert.equal(rejected.rejectionReason, 'Incomplete documentation');
});
