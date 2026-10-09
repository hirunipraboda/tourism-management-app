# Non-Functional Testing Defect Log & Architectural Findings

This document records the defects, performance bottlenecks, and architectural findings discovered during the Non-Functional Testing phase of the NOVA Smart Tourism Platform.

---

## Defect Summary

| Defect ID | Severity | Category | Description | Status | Resolution Details |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-NFR-001** | High | Recovery / Lifecycle | Database template clone dropped prematurely during server restart simulation (`NFR-REC-001`). | **Resolved** | Added `ownsDb` lifecycle parameter to `NovaApiHost`. When testing server re-instantiation against an existing database, `ownsDb: false` prevents premature database teardown. |
| **DEF-NFR-002** | Medium | Performance / DB | Read queries under 100 concurrent users experienced memory overhead due to EF Core change tracking. | **Resolved** | Verified `AsNoTracking()` usage across read-only endpoints (`GET /api/destinations`, `GET /api/v1/guides`), reducing memory allocations and stabilizing p95 latency under 120ms. |
| **DEF-NFR-003** | Medium | Security / Error Leaks | Unhandled internal database error had potential to leak SQL statement snippets. | **Resolved** | Enforced RFC 7807 `ProblemDetails` exception handling middleware; database connection strings and raw SQL error messages are strictly suppressed. |
| **DEF-NFR-004** | Low | Accessibility / Mobile | Compact icon buttons on mobile viewport had touch targets under 40x40px. | **Resolved** | Updated CSS tokens and component styles to guarantee touch targets meet or exceed WCAG 2.1 AA recommendation of 44x44px. |
| **DEF-NFR-005** | Low | Resilience / Fallback | AI recommendation service timeout caused delay when external LLM was unresponsive. | **Resolved** | Implemented fast-fail circuit breaker and timeout (3 seconds) with deterministic rule-based fallback, maintaining sub-350ms user experience. |

---

## Detailed Investigation Reports

### DEF-NFR-001: Isolated Database Lifecycle During Server Restart
- **Test ID:** `NFR-REC-001` (Backend Server Restart Simulation)
- **Symptom:** In tests simulating backend crashes or restarts, disposing `NovaApiHost` triggered `PgTestDatabase.DisposeAsync()`, dropping the active database. The second `NovaApiHost` instance failed to connect because the database no longer existed.
- **Fix:** Enhanced `NovaApiHost` with ownership delegation:
  ```csharp
  public class NovaApiHost : IAsyncDisposable
  {
      private readonly bool _ownsDb;
      public NovaApiHost(PgTestDatabase db, bool ownsDb = true)
      {
          _db = db;
          _ownsDb = ownsDb;
      }

      public async ValueTask DisposeAsync()
      {
          await _factory.DisposeAsync();
          if (_ownsDb)
          {
              await _db.DisposeAsync();
          }
      }
  }
  ```
  Test `NFR-REC-001` creates the first host with `ownsDb: false`, disposes the host, initializes the second host with `ownsDb: true`, and verifies that all state persisted across the restart.

---

### DEF-NFR-002: EF Core Change Tracking Under High Concurrency
- **Test ID:** `NFR-LOAD-004` (100 Concurrent Users Load) & `NFR-STRESS-002` (High Request Volume Burst)
- **Investigation:** Under concurrent load of 100 requests in rapid succession, memory allocations spiked if Entity Framework Core tracked all materialized entities in memory.
- **Verification:** Repository queries for read-only listings use `.AsNoTracking()`. Measured response latency remained consistently below 120ms, well within the 200ms SLA.

---

### DEF-NFR-003: Defensive Security Headers & Exception Masking
- **Test ID:** `NFR-SEC-009` & `NFR-SEC-010`
- **Verification:** Security scanning confirmed that:
  - `X-Content-Type-Options: nosniff` is emitted on all HTTP responses.
  - CORS preflight handles allowed origins without wildcard `*` with credentials.
  - 500 error responses emit generic title `"An error occurred while processing your request"` with a unique trace ID, preventing stack trace disclosure to untrusted clients.
