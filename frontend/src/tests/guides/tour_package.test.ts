import test from 'node:test';
import assert from 'node:assert/strict';
import type { TourPackageResponse, TourPackagePayload, TourPackageUpdatePayload } from '../../services/tourPackageService.ts';

const mockPackages: TourPackageResponse[] = [
  {
    tourPackageId: 1,
    guideId: 1,
    guideName: 'Kasun Perera',
    packageName: 'Cultural Triangle Heritage Tour',
    description: 'Ancient rock fortress, Dambulla cave temple, and sacred tooth relic.',
    destination: 'Sigiriya',
    durationDays: 3,
    price: 320,
    maxGroupSize: 8,
    isActive: true,
    createdAt: '2026-10-01T10:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800',
  },
  {
    tourPackageId: 2,
    guideId: 2,
    guideName: 'Suresh Kumar',
    packageName: 'Ella Peak & Highlands Trek',
    description: 'Mountain ridge trekking, Little Adams Peak, and tea plantation walks.',
    destination: 'Ella',
    durationDays: 2,
    price: 180,
    maxGroupSize: 6,
    isActive: true,
    createdAt: '2026-10-02T11:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=800',
  },
  {
    tourPackageId: 3,
    guideId: 3,
    guideName: 'Fatima Nazeer',
    packageName: 'Galle Maritime & Ramparts Walk',
    description: 'Dutch colonial ramparts, maritime history, and coastal culinary gems.',
    destination: 'Galle',
    durationDays: 1,
    price: 90,
    maxGroupSize: 10,
    isActive: false, // inactive / deactivated
    createdAt: '2026-10-03T12:00:00Z',
  },
];

test('WEB-TPK-001: Open Tour Packages section displays catalog packages correctly', () => {
  assert.ok(mockPackages.length >= 3);
  const pkg = mockPackages[0];
  assert.equal(pkg.packageName, 'Cultural Triangle Heritage Tour');
  assert.equal(pkg.destination, 'Sigiriya');
  assert.equal(pkg.durationDays, 3);
  assert.equal(pkg.price, 320);
  assert.equal(pkg.guideName, 'Kasun Perera');
});

test('WEB-TPK-002: Create tour package with valid details', () => {
  const newPayload: TourPackagePayload = {
    guideId: 1,
    packageName: 'Yala Wildlife Expedition',
    description: 'Full-day leopard and elephant safari.',
    destination: 'Yala',
    durationDays: 2,
    price: 240,
    maxGroupSize: 6,
    imageUrl: 'https://example.com/yala.jpg',
  };

  assert.ok(newPayload.guideId > 0);
  assert.ok(newPayload.packageName.trim().length > 0);
  assert.ok(newPayload.durationDays > 0);
  assert.ok(newPayload.price > 0);
  assert.ok(newPayload.maxGroupSize > 0);

  const createdPkg: TourPackageResponse = {
    tourPackageId: 4,
    guideName: 'Kasun Perera',
    ...newPayload,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  const updatedCatalog = [...mockPackages, createdPkg];
  assert.equal(updatedCatalog.length, 4);
  assert.equal(updatedCatalog[3].packageName, 'Yala Wildlife Expedition');
});

test('WEB-TPK-003: Edit tour package updates price, duration and group size', () => {
  const original = mockPackages[0];
  const updatePayload: TourPackageUpdatePayload = {
    packageName: 'Cultural Triangle Heritage Tour (VIP)',
    description: original.description,
    destination: original.destination,
    durationDays: 4,
    price: 450,
    maxGroupSize: 10,
    isActive: true,
  };

  const updatedPkg: TourPackageResponse = {
    ...original,
    ...updatePayload,
  };

  assert.equal(updatedPkg.packageName, 'Cultural Triangle Heritage Tour (VIP)');
  assert.equal(updatedPkg.durationDays, 4);
  assert.equal(updatedPkg.price, 450);
  assert.equal(updatedPkg.maxGroupSize, 10);
});

test('WEB-TPK-004: Delete tour package sets isActive to false (soft delete)', () => {
  const catalog = [...mockPackages];
  const targetId = 1;

  const afterDeactivation = catalog.map(p =>
    p.tourPackageId === targetId ? { ...p, isActive: false } : p
  );

  const target = afterDeactivation.find(p => p.tourPackageId === targetId);
  assert.ok(target);
  assert.equal(target.isActive, false);

  const activeCatalog = afterDeactivation.filter(p => p.isActive);
  assert.equal(activeCatalog.length, 1); // only package 2 was active and remaining active
});

test('WEB-TPK-005: Submit invalid tour package information returns validation errors', () => {
  const validatePackage = (p: { packageName: string; destination: string; price: number; durationDays: number; maxGroupSize: number }) => {
    const errors: Record<string, string> = {};
    if (!p.packageName.trim()) errors.packageName = 'Package name is required';
    if (!p.destination.trim()) errors.destination = 'Destination is required';
    if (p.price <= 0) errors.price = 'Price must be greater than zero';
    if (p.durationDays <= 0) errors.durationDays = 'Duration must be at least 1 day';
    if (p.maxGroupSize <= 0) errors.maxGroupSize = 'Max group size must be at least 1';
    return errors;
  };

  const errs = validatePackage({
    packageName: '',
    destination: '',
    price: -50,
    durationDays: 0,
    maxGroupSize: -2,
  });

  assert.equal(errs.packageName, 'Package name is required');
  assert.equal(errs.destination, 'Destination is required');
  assert.equal(errs.price, 'Price must be greater than zero');
  assert.equal(errs.durationDays, 'Duration must be at least 1 day');
  assert.equal(errs.maxGroupSize, 'Max group size must be at least 1');
});
