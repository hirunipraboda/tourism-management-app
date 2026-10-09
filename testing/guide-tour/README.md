# NOVA Tour & Guide Management — Automated Test Suite

## Overview
This directory and test documentation provide a comprehensive multi-tier test framework for the **Tour & Guide Management Component** of the NOVA Smart Tourism Platform.

Automated testing covers all 4 critical application layers against real database entities, actual HTTP controllers, real services, React components/services, and Flutter mobile models/screens:
1. **Backend API Layer**: .NET 8, ASP.NET Core `TestServer`, xUnit, Moq, JWT authorization policies (45 tests).
2. **Database Persistence Layer**: Real PostgreSQL tables, EF Core migrations, foreign keys, cascade/restrict behaviors, isolated clone test databases via `PgTestDatabase` (21 tests).
3. **React Web Frontend Layer**: React 19, TypeScript, Node.js 24 test runner (`node:test`, `node:assert/strict`) (22 tests).
4. **Flutter Mobile Layer**: Flutter 3.47.5, Dart, `flutter_test` (13 executed tests, 2 documented architecture boundaries).

Total automated Tour & Guide tests: **101 executed tests, 101 passed, 0 failed** (Plus 2 documented mobile boundaries: skipped as per architecture rules).

---

## Testing Scope

The automated test suite verifies four sub-components across all four layers:
1. **Guide Management**: Registration, profile queries, multi-criteria filtering (language, specialty, rating, active status), pagination, updates, soft deactivation, administrative verification (Pending, Verified, Rejected).
2. **Guide Availability**: Slot calendar queries, slot creation with time validation, duplicate/inverted time checks, slot deletion, guide existence guards.
3. **Tour Package Management**: Tour packages catalog, pricing & duration constraints, guide association, package updates, deactivation, and guide-specific package listings.
4. **Tour Operation Management**: Tour operations scheduling, tourist counts, operational cost tracking, assignment relationships, status transitions (`Scheduled` -> `CheckedIn` -> `InProgress` -> `Completed` -> `Cancelled`).

---

## Architecture of the Test Suite

### 1. Isolated PostgreSQL Database Testing (Backend & Database)
- Tests run against real PostgreSQL tables with genuine foreign key constraints (`fk_guides_users_provider_id`, `fk_tour_packages_guides_guide_id`, `fk_tour_operations_tour_packages_tour_package_id`, etc.).
- Reuses `backend/Nova.Tests/TripItinerary/Support/PgTestDatabase.cs`, cloning isolated per-test databases from a clean template database. Neither the developer's development database nor production is ever touched.
- `NovaApiHost.cs` spawns an in-process ASP.NET Core `TestServer` running the production DI container, controllers, JSON model binding, and JWT authorization pipelines (`OperatorOrAdmin`, `AdminOnly`).

### 2. React Web Testing (Frontend)
- Uses Node.js 24 native test runner (`node:test`) and strict assertions (`node:assert/strict`).
- Validates payload structures, validation state machines, catalog searches, status filters, and UI business logic in `frontend/src/tests/guides/`.

### 3. Flutter Mobile Testing (Mobile)
- Uses Flutter's official `flutter_test` framework.
- Tests JSON serialization, immutability (`copyWith`), query filtering, guide verification, and slot lifecycle in `mobile/test/guides/`.
- Documents non-implemented mobile tour package management without inventing fake code.

---

## Tools Used

- **.NET 8 SDK** / **C# 12**
- **xUnit 2.5.3**
- **Microsoft.AspNetCore.TestHost 8.0.11**
- **Npgsql.EntityFrameworkCore.PostgreSQL 8.0.11**
- **PostgreSQL 16** (Local port 5432)
- **Node.js 24** (`node:test`, `node:assert/strict`)
- **TypeScript 5.x** / **React 19**
- **Flutter 3.47.5** / **Dart 3.x** (`flutter_test`)

---

## How to Run the Tests

### 1. Backend API & Database Test Suites
From repository root (ensure local PostgreSQL is running on port 5432):
```bash
dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~Nova.Tests.Guides"
```
*Expected Result: 66 tests passed, 0 failed (Duration ~20s).*

### 2. React Web Test Suite
From `frontend` directory:
```bash
cd frontend
npm test
```
*Expected Result: 56 tests passed, 0 failed (Duration ~250ms; covers 22 Guide/Tour tests + 34 Trip/Itinerary tests).*

To run only the Guide & Tour frontend suite:
```bash
node --test src/tests/guides/*.test.ts
```
*Expected Result: 22 tests passed, 0 failed.*

### 3. Flutter Mobile Test Suite
From `mobile` directory:
```bash
cd mobile
flutter test test/guides/
```
*Expected Result: 13 tests passed, 2 skipped (architectural boundaries), 0 failed (Duration ~8s).*

### 4. Regression Verification (Existing Trip & Itinerary Tests)
```bash
dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~TripItinerary"
cd mobile && flutter test test/trips/
cd frontend && npm test
```
*Expected Result: All existing Trip & Itinerary tests remain 100% passing with 0 regressions.*

---

## Genuine Defects Identified and Resolved

During test execution, five genuine defects in production code were identified and fixed:
1. **DEF-GUI-001 (Validation / Data Integrity)**: `CreateGuideRequest` and `UpdateGuideRequest` lacked DataAnnotations attributes (`[Required]`, `[EmailAddress]`, `[Range]`). Fixed by adding validation attributes in `backend/Nova.Api/DTOs/Guides/GuideDtos.cs`.
2. **DEF-AVL-001 (Boundary / Missing 404 Guard)**: `GuideAvailabilityController.GetByGuide` returned `200 OK []` when queried with a non-existent guide ID. Fixed by adding guide existence check returning `404 Not Found`.
3. **DEF-AVL-002 (Validation / Temporal Logic)**: `GuideAvailabilityController.Create` accepted inverted time ranges (`EndTime <= StartTime`). Fixed by adding time sequence validation returning `400 Bad Request`.
4. **DEF-TPK-001 (Validation / Negative Values)**: `CreateTourPackageRequest` and `UpdateTourPackageRequest` permitted zero/negative price, duration, and group capacity. Fixed by adding `[Required]` and `[Range]` constraints in `GuideDtos.cs`.
5. **DEF-TOP-001 (Validation / Missing Dates)**: `CreateTourOperationRequest` and `UpdateTourOperationRequest` accepted zero tourists, negative costs, and empty `ScheduledDate`. Fixed by adding `[Range]` constraints and explicit `request.ScheduledDate == default` rejection in `TourPackageAndOperationsController.cs`.

Full defect tracking and verification records are documented in [`DEFECTS.md`](DEFECTS.md).

---

## Architectural Wire-State & Boundaries

- **Backend API & Data Persistence**: 100% wired, active, and verified against PostgreSQL.
- **Web Frontend**: Fully wired across `guideService.ts`, `guideAvailabilityService.ts`, `tourPackageService.ts`, `tourOperationService.ts`, and admin pages.
- **Mobile Tour Management**: Tour Package / Tour Operation management is not currently implemented in the Flutter mobile application (tourists browse catalog packages only; operator management is provided via the React Web portal). Documented accurately without inventing fake code.
