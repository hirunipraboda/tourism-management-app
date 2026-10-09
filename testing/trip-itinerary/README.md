# NOVA Trip & Itinerary Management — Automated Test Suite

## Overview
This directory and test documentation provide a multi-tier test framework for the **Trip & Itinerary Management Component** of the NOVA Tourism Management platform.

Testing exercises all 4 layers of the application against real database tables, actual HTTP controllers, real services, AI agents, mobile widgets/models, and web frontend utilities:
1. **Backend Layer**: .NET 8, PostgreSQL, EF Core, ASP.NET Core `TestServer`, xUnit, Moq (53 tests).
2. **AI Multi-Agent Layer**: Python 3.11, LangGraph, Gemini model integration, pytest (4 tests).
3. **Mobile Layer**: Flutter 3.47.5, Dart, `flutter_test` (16 tests).
4. **Web Frontend Layer**: React 19, TypeScript, Node.js 24 test runner (`node:test`) (34 tests).

Total automated tests: **107 executed tests, 107 passed, 0 failed**.

---

## Architecture of the Test Suite

### 1. Isolated PostgreSQL Database Testing (Backend)
- Tests do **not** run against a mocked in-memory database or affect the live production/Supabase database.
- Uses `backend/Nova.Tests/TripItinerary/Support/PgTestDatabase.cs` which clones isolated per-test databases from a clean template database.
- `NovaApiHost.cs` spawns an in-process ASP.NET Core `TestServer` running the production DI container, controllers, authentication, and authorization pipelines.

### 2. Microservice Boundary Isolation (AI Agents)
- Backend tests mock only the external HTTP microservice boundary (`IAiAgentClient`), allowing verification of both the external agent path and the native 4-agent C# fallback pipeline.
- The Python multi-agent system (`ai-agents/`) has its own end-to-end `pytest` suite exercising the actual LangGraph graph, fallback cost parsers, and node state transitions.

### 3. Mobile & Frontend Verification
- Mobile unit and model tests (`mobile/test/trips/`) verify JSON serialization, date logic, trip filtering, day/activity regeneration, and approval status lifecycles.
- Frontend tests (`frontend/src/tests/trips/`) verify the real trip timeline engine, date consistency validation, transit leg selection, and approval state machines.

---

## How to Run the Tests

### 1. Backend .NET 8 Test Suite
Ensure local PostgreSQL is running (default port 5432). From repository root:
```bash
dotnet test backend/Nova.Tests/Nova.Tests.csproj --filter "FullyQualifiedName~TripItinerary"
```
*Expected Result: 53 tests passed, 0 failed (Duration ~15s).*

### 2. AI Multi-Agent Pytest Suite
From `ai-agents` directory:
```bash
cd ai-agents
pytest tests/ -v
```
*Expected Result: 4 tests passed, 0 failed (Duration ~16s).*

### 3. Mobile Flutter Test Suite
From `mobile` directory:
```bash
cd mobile
flutter test test/trips/
```
*Expected Result: 16 tests passed, 0 failed (Duration ~11s).*

### 4. Frontend Node Test Suite
From `frontend` directory:
```bash
cd frontend
npm test
```
*Expected Result: 34 tests passed, 0 failed (Duration ~200ms).*

---

## Test Case Coverage Mapping

All 39 core test cases are traced in detail in [`TEST_CASE_MAPPING.md`](TEST_CASE_MAPPING.md):
- **TRP-001 to TRP-012**: Trip Core Management (creation, validation, filtering, pagination, details, ownership, updates, date cascading, deletion).
- **ATP-001 to ATP-008**: AI Trip Planner (generation, input validation, DB persistence, day/activity regeneration, retrieval, deletion, fallback).
- **ITN-001 to ITN-015**: Itinerary & Transport (days creation, item timing & costs, public transport search & attachment, operator approvals & reviews).
- **GEN-001 to GEN-004**: Generation Workflows (async execution, audit logs, constraint handling, safe failure recovery).

---

## Genuine Defects Identified and Resolved
During test execution, five genuine defects in production code were discovered and fixed:
1. **DEF-001 (Validation)**: `TripService.CreateTripAsync` accepted missing `StartDate`/`EndDate` because `DateTime` defaulted to `0001-01-01`. Fixed by adding explicit validation rejecting `default(DateTime)`.
2. **DEF-002 (Security / BOLA)**: `AuthController` generates role `"USER"` for tourists. Services only checked `userRole.Equals("Tourist")`, allowing tourists to bypass ownership checks on trips and itineraries. Fixed with `IsRestrictedUser` across all services and adding ownership check in `TripsController.GetTripsByUser`.
3. **DEF-003 (Crash)**: `ai-agents/server.py` crashed when converting attraction costs like `"Free access..."` to `float`. Fixed by safely extracting numeric prices or setting `0.0`.
4. **DEF-004 (Crash)**: `TransportService.cs` crashed EF Core by including `[NotMapped]` property `SelectedTransport`. Fixed by querying `TransportOptions` table directly.
5. **DEF-005 (Crash)**: `TripPlannerController.SaveTripPlan` queried `t.Destination` in LINQ, which is `[NotMapped]`, crashing SQL translation. Fixed by querying mapped property `t.TripName` and updating `[Authorize(Roles = "TourismOperator,Admin,ADMIN")]`.

---

## Wire-State Distinction Note
- **Backend API & Data Persistence**: 100% wired, active, and verified against PostgreSQL.
- **Frontend Admin Approval UI**: The React UI component manages approval transitions using local component state rather than calling `POST /api/itineraries/:id/approve`. Documented as `NOT WIRED` at UI integration layer, while the underlying backend controller and service endpoints are fully implemented and verified.
