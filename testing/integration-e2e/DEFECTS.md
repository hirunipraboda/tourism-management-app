# Integration & E2E Testing Defect Log

This document records the genuine defects, design discrepancies, and resolution details discovered during the whole-system Integration and End-to-End testing phase of the NOVA Smart Tourism Platform.

---

## Defect Summary

| Defect ID | Severity | Area | Description | Resolution Status | Resolution Details |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-INT-001** | High | Backend API / Serialization | Guide Availability payload failed to deserialize when using ISO-8601 full datetime strings. | **Resolved** | .NET 8 `System.Text.Json` enforces strict formatting for `DateOnly` (`yyyy-MM-dd`) and `TimeOnly` (`HH:mm:ss`). Test fixtures and frontend contract updated to format strings explicitly. |
| **DEF-INT-002** | Medium | Backend API / Tour Operations | Full `PUT` updates on tour operations caused unintended property overwrites when transitioning status. | **Resolved** | Discovered and verified dedicated `PATCH /api/v1/tour-operations/{id}/status` endpoint with `UpdateTourOperationStatusRequest` DTO, maintaining entity integrity. |
| **DEF-INT-003** | Medium | Frontend / E2E Automation | Playwright locator matched hidden anti-bot honeypot inputs on registration page. | **Resolved** | Explicitly scoped selectors to user-facing input elements using `page.locator('input[type="text"]:visible')` and semantic ARIA labels. |
| **DEF-INT-004** | Low / Architectural | Security / RBAC | Tourist role attempting `POST /api/itineraries/{id}/approve` receives HTTP 403 Forbidden. | **Documented as Expected Boundary** | Controller enforces `[Authorize(Roles = "TourismOperator,Admin,ADMIN")]`. Regular tourists cannot self-approve; tests updated to assert 403 for tourists and 200 for operators. |
| **DEF-INT-005** | Medium | Test Runner / Playwright | Root directory execution caused `@playwright/test` package resolution conflict. | **Resolved** | Enforced test runner invocation inside `frontend/` with project targets configured for installed browsers (Google Chrome & Microsoft Edge). |
| **DEF-INT-006** | Low | Data Normalization | Case sensitivity in destination search ("sigiriya" vs "Sigiriya") caused transient empty query results. | **Resolved** | Destination service queries verify PostgreSQL `ILIKE` pattern matching across name and region attributes. |

---

## Detailed Defect Reports

### DEF-INT-001: Guide Availability Serialization Failure
- **Component:** `backend/Nova.Api/Controllers/GuideAvailabilityController.cs`
- **Root Cause:** The `CreateAvailabilityRequest` record defines:
  ```csharp
  public record CreateAvailabilityRequest(
      DateOnly Date,
      TimeOnly StartTime,
      TimeOnly EndTime,
      decimal? CustomHourlyRate,
      string? Notes);
  ```
  Standard JavaScript `toISOString()` produces `"2026-10-15T09:00:00.000Z"`. System.Text.Json fails to convert this to `DateOnly` or `TimeOnly`, returning HTTP 400 Bad Request (`The JSON value could not be converted to System.DateOnly`).
- **Fix:** Clients and integration suites must supply format `"2026-10-15"` and `"09:00:00"`. Verified in test suite `E2E-007` and `API-INT-007`.

---

### DEF-INT-002: Tour Operation Status Lifecycle Updating
- **Component:** `backend/Nova.Api/Controllers/TourOperationsController.cs`
- **Root Cause:** Attempting to update operation status via the general update endpoint required supplying full entity fields (tour package ID, guide ID, max capacity, price), risking accidental field nulling.
- **Fix:** Switched to the dedicated status endpoint:
  ```http
  PATCH /api/v1/tour-operations/{id}/status
  Content-Type: application/json

  {
    "status": "InProgress"
  }
  ```
  Verified lifecycle progression (`Scheduled` -> `InProgress` -> `Completed`) in `E2E-014`.

---

### DEF-INT-003: Anti-Bot Honeypot Interference in Browser Tests
- **Component:** `frontend/src/pages/auth/RegisterPage.tsx` & `frontend/e2e/auth.spec.ts`
- **Root Cause:** The registration form includes a hidden honeypot field `<input name="website" tabIndex={-1} autoComplete="off" />` to mitigate automated bot registrations. Broad Playwright query `page.locator('input')` intermittently filled the honeypot, causing registration failure.
- **Fix:** Targeted exact inputs with role and semantic placeholders: `page.locator('input[placeholder="John Doe"]')`. Verified 100% pass across Chrome and Edge.

---

### DEF-INT-004: Itinerary Self-Approval RBAC Constraint
- **Component:** `backend/Nova.Api/Controllers/ItinerariesController.cs`
- **Observed Behavior:** Tourist creating an itinerary cannot approve their own itinerary via `POST /api/itineraries/{id}/approve`.
- **Architectural Rationale:** NOVA's business design requires official tourism operators or platform administrators to review and approve commercial itineraries before they become finalized tour packages or certified schedules.
- **Verification:** Test `E2E-013` asserts both sides of the boundary: Tourist user token yields HTTP 403 Forbidden; Operator/Admin token yields HTTP 200 OK with `Approved` status.
