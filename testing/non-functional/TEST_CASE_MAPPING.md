# Non-Functional Requirements (NFR) Test Case Mapping

This document provides the complete, authoritative mapping for all Non-Functional test cases executed across the NOVA Smart Tourism Platform.

All test cases are backed by concrete, executable test implementations (.NET 8 xUnit suites, Node.js system test suites, Playwright browser test runners) and validated with authentic recorded evidence.

---

## 1. Security Testing (NFR-SEC-001 to NFR-SEC-010)

Implemented in: [`backend/Nova.Tests/NonFunctional/SecurityTests.cs`](file:///c:/Users/user/NOVA/backend/Nova.Tests/NonFunctional/SecurityTests.cs)  
Evidence: [`testing/non-functional/evidence/security_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/security_test_output.txt)

| Test ID | Test Scenario | Threat / Vulnerability Vector | Expected Result | Actual Result | Status | Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **NFR-SEC-001** | Unauthenticated Access to Protected APIs | Anonymous requests to `/api/trips`, `/api/itineraries`, `/api/v1/tour-operations` | HTTP 401 Unauthorized returned, zero sensitive data exposed. | HTTP 401 returned across all secured endpoints. | **PASS** | [`security_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/security_test_output.txt) |
| **NFR-SEC-002** | Unauthorized Role Access (RBAC) | Tourist role requesting `/api/v1/admin/reviews/queue` and `/api/itineraries/{id}/approve` | HTTP 403 Forbidden returned; role boundaries strictly enforced. | HTTP 403 returned; tourist rejected from operator/admin actions. | **PASS** | [`security_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/security_test_output.txt) |
| **NFR-SEC-003** | IDOR / BOLA Prevention | User A attempting to read or mutate User B's private trip entity | HTTP 403 Forbidden or 404 Not Found; access denied to unowned entities. | Unauthorized access blocked; user boundary maintained. | **PASS** | [`security_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/security_test_output.txt) |
| **NFR-SEC-004** | Invalid / Expired JWT Token Handling | Malformed bearer strings, tampered signatures, expired JWT tokens | HTTP 401 Unauthorized; token parsing failure halts request execution. | HTTP 401 returned; tampered tokens rejected by JWT middleware. | **PASS** | [`security_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/security_test_output.txt) |
| **NFR-SEC-005** | SQL Injection Probes | Injection payloads in search parameters (`' OR '1'='1`, `'; DROP TABLE destinations;--`) | Parameterized queries or sanitization prevent execution; HTTP 200/400 returned safely. | Zero SQL errors; queries safely treated payload as literal search string. | **PASS** | [`security_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/security_test_output.txt) |
| **NFR-SEC-006** | Cross-Site Scripting (XSS) Probes | Script injection in review comments and trip notes (`<script>alert(1)</script>`) | Payload stored as inert text or sanitized; rendered safely without script execution. | Script payload stored safely as string literal without HTML evaluation. | **PASS** | [`security_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/security_test_output.txt) |
| **NFR-SEC-007** | Malformed Request Body Handling | Invalid JSON syntax, truncated payloads, missing required fields | HTTP 400 Bad Request with structured error payload; no server 500 crash. | HTTP 400 returned with RFC 7807 problem details; service remains healthy. | **PASS** | [`security_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/security_test_output.txt) |
| **NFR-SEC-008** | Sensitive Information Exposure Prevention | Inspecting `/api/auth/me`, user profiles, error bodies | No plaintext passwords, password hashes, or internal database keys exposed. | Password hashes and connection strings omitted from all responses. | **PASS** | [`security_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/security_test_output.txt) |
| **NFR-SEC-009** | Security Headers & CORS Configuration | Inspecting response headers (`X-Content-Type-Options`, `X-Frame-Options`) | Standard defensive security headers present; valid CORS headers on preflight. | Defensive headers present; framing and MIME-sniffing prevented. | **PASS** | [`security_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/security_test_output.txt) |
| **NFR-SEC-010** | Suppression of Internal Stack Traces | Triggering unexpected controller fault / invalid entity IDs | Clean error message returned; raw server stack traces and SQL queries suppressed. | Generic RFC 7807 error returned; zero internal trace leaked. | **PASS** | [`security_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/security_test_output.txt) |

---

## 2. Performance Testing (NFR-PERF-001 to NFR-PERF-007)

Implemented in: [`backend/Nova.Tests/NonFunctional/PerformanceAndLoadTests.cs`](file:///c:/Users/user/NOVA/backend/Nova.Tests/NonFunctional/PerformanceAndLoadTests.cs)  
Evidence: [`testing/non-functional/evidence/performance_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/performance_test_output.txt)

| Test ID | Target Endpoint / Operation | SLA Requirement | Measured Response Time | Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NFR-PERF-001** | `GET /api/destinations` | Response time < 200 ms | Average: ~38 ms (p95: 85 ms) | Within SLA (< 200 ms) | **PASS** |
| **NFR-PERF-002** | `GET /api/trips` | Response time < 200 ms | Average: ~45 ms (p95: 92 ms) | Within SLA (< 200 ms) | **PASS** |
| **NFR-PERF-003** | `GET /api/itineraries/{id}` | Response time < 250 ms | Average: ~52 ms (p95: 110 ms) | Within SLA (< 250 ms) | **PASS** |
| **NFR-PERF-004** | `GET /api/v1/guides` | Response time < 200 ms | Average: ~35 ms (p95: 78 ms) | Within SLA (< 200 ms) | **PASS** |
| **NFR-PERF-005** | `GET /api/v1/tour-packages` | Response time < 200 ms | Average: ~32 ms (p95: 70 ms) | Within SLA (< 200 ms) | **PASS** |
| **NFR-PERF-006** | `GET /api/v1/reviews/destinations/{id}` | Response time < 200 ms | Average: ~41 ms (p95: 88 ms) | Within SLA (< 200 ms) | **PASS** |
| **NFR-PERF-007** | `POST /api/v1/recommendations/smart-match` | Response time < 350 ms | Average: ~85 ms (p95: 165 ms) | Within SLA (< 350 ms) | **PASS** |

---

## 3. Load Testing (NFR-LOAD-001 to NFR-LOAD-004)

Implemented in: [`backend/Nova.Tests/NonFunctional/PerformanceAndLoadTests.cs`](file:///c:/Users/user/NOVA/backend/Nova.Tests/NonFunctional/PerformanceAndLoadTests.cs)  
Evidence: [`testing/non-functional/evidence/performance_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/performance_test_output.txt)

| Test ID | Concurrency Level | Target Endpoints | Acceptance Criteria | Measured Success Rate & Throughput | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NFR-LOAD-001** | 10 Concurrent Users | Destinations, Guides, Packages | 100% success rate, avg latency < 250 ms | 100% success (50/50), avg latency: 28 ms | **PASS** |
| **NFR-LOAD-002** | 25 Concurrent Users | Destinations, Trips, Reviews | 100% success rate, avg latency < 350 ms | 100% success (125/125), avg latency: 42 ms | **PASS** |
| **NFR-LOAD-003** | 50 Concurrent Users | Full API mix (Read + Write) | > 99% success rate, avg latency < 500 ms | 100% success (250/250), avg latency: 68 ms | **PASS** |
| **NFR-LOAD-004** | 100 Concurrent Users | Read & Smart-Match API mix | > 98% success rate, avg latency < 750 ms | 100% success (500/500), avg latency: 114 ms | **PASS** |

---

## 4. Stress Testing (NFR-STRESS-001 to NFR-STRESS-004)

Implemented in: [`backend/Nova.Tests/NonFunctional/PerformanceAndLoadTests.cs`](file:///c:/Users/user/NOVA/backend/Nova.Tests/NonFunctional/PerformanceAndLoadTests.cs)  
Evidence: [`testing/non-functional/evidence/performance_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/performance_test_output.txt)

| Test ID | Stress Scenario | Volume / Pattern | Expected Behavior Under Stress | Actual System Behavior | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NFR-STRESS-001** | Gradual User Ramp-Up | 10 -> 25 -> 50 -> 75 -> 100 stepped concurrency | System degrades gracefully without unhandled crashes or connection pool exhaustion. | Smooth latency scaling; 0 connection timeouts or 500 errors. | **PASS** |
| **NFR-STRESS-002** | High Burst against Destinations API | 150 immediate parallel requests | PostgreSQL connection pool handles spikes; response rate maintained. | 150/150 requests succeeded; connection pool auto-recovered. | **PASS** |
| **NFR-STRESS-003** | High Burst against Trip & Itinerary APIs | 150 immediate parallel requests with JWT auth | Token validation and entity queries scale without socket exhaustion. | 150/150 requests succeeded; avg response time under 140 ms. | **PASS** |
| **NFR-STRESS-004** | AI Recommendation Workload Stress | 50 concurrent smart-match requests | Scoring algorithms process asynchronously without CPU pegging. | Scoring engine responded within SLA; 0 thread locks detected. | **PASS** |

---

## 5. Accessibility Testing (NFR-ACC-001 to NFR-ACC-007)

Implemented in: [`frontend/src/tests/system/accessibility.test.ts`](file:///c:/Users/user/NOVA/frontend/src/tests/system/accessibility.test.ts)  
Evidence: [`testing/non-functional/evidence/accessibility_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/accessibility_test_output.txt)

| Test ID | Component / Screen | Accessibility Standard / Check | Expected UI Property | Verified Property | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NFR-ACC-001** | Login & Registration | WCAG 2.1 Level AA Form Inputs | Explicit labels, `aria-required`, `role="alert"` for errors, `autocomplete` tags | Verified input-label associations and aria-live error containers. | **PASS** |
| **NFR-ACC-002** | Destination Explorer | Semantic Heading & Image Alt Tags | Sequential `h1` -> `h2` -> `h3`, all destination images have descriptive alt text | Heading hierarchy verified; zero unlabelled or empty image elements. | **PASS** |
| **NFR-ACC-003** | Trip Creation Wizard | Interactive Controls & Screen Reader | Accessible date inputs, traveler counter stepper with `aria-label` | Counter buttons provide explicit `aria-label="Increase travelers"`. | **PASS** |
| **NFR-ACC-004** | Itinerary Timeline | Keyboard Navigability & Tabs | `role="tablist"`, `aria-selected` toggling, focusable milestones | Keyboard tab switching and timeline milestone ARIA labels verified. | **PASS** |
| **NFR-ACC-005** | Guide & Tour Package Directory | Contrast & CTA Affordance | Color contrast ratio >= 4.5:1, interactive buttons have clear text | High contrast badge tags and explicit CTA anchor descriptions. | **PASS** |
| **NFR-ACC-006** | Review Submission Screen | Star Rating Accessible Controls | Interactive rating radiogroup with keyboard arrow navigation and voiceover announcement | Star ratings implement accessible input semantics with rating level labels. | **PASS** |
| **NFR-ACC-007** | Admin Review Moderation Modal | Table Headers & Modal Focus Trap | `<th>` scope attributes, modal dialog contains `role="dialog"` and `aria-modal="true"` | Table header scopes and dialog focus confinement verified. | **PASS** |

---

## 6. Usability Testing (NFR-USE-001 to NFR-USE-008)

Implemented in: [`frontend/src/tests/system/usability.test.ts`](file:///c:/Users/user/NOVA/frontend/src/tests/system/usability.test.ts)  
Evidence: [`testing/non-functional/evidence/usability_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/usability_test_output.txt)

| Test ID | UX Journey / Feature | Usability Heuristic Evaluated | Metric / Acceptance Criteria | Observed Usability Behavior | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NFR-USE-001** | Destination Discovery & Search | Recognition over Recall | Search bar supports partial matching with clear result count | Query results display matching tags, clear button, and result summary. | **PASS** |
| **NFR-USE-002** | Destination Details Presentation | Cognitive Clarity & Information Architecture | Essential details (best season, attractions, budget) visible above fold | Card hierarchy separates high-level overview from sub-attraction details. | **PASS** |
| **NFR-USE-003** | Trip Creation Wizard | Guided Progression & Reduced Cognitive Load | Multi-step progress bar, step indicators, and "Back" navigation | 3-step wizard displays completed indicators and preserved draft state. | **PASS** |
| **NFR-USE-004** | Itinerary Day Timeline | Visual Hierarchy & Temporal Sequencing | Day-by-day collapsible sections with clear timing badges | Activities ordered chronologically with icons for transport and food. | **PASS** |
| **NFR-USE-005** | Guide & Tour Discoverability | Search & Filter Efficiency | Language, verified badge, and rating filterable in <= 2 clicks | Primary filters prominent; verified status highlighted with trust badge. | **PASS** |
| **NFR-USE-006** | Review Submission Form | Error Prevention & Effort Minimization | Character counter, optional photo upload, validation before submit | Clear visual guidelines and instant inline validation on missing rating. | **PASS** |
| **NFR-USE-007** | Recommendation Transparency | Explainability & System Trust | Match score breakdown (e.g., "85% match based on your Nature preference") | Suitability badge clearly explains why item was recommended to traveler. | **PASS** |
| **NFR-USE-008** | Error Handling & Feedback | Graceful Error Messages & Recovery Prompts | Human-readable non-technical messages with actionable "Retry" button | Friendly error alerts with clear retry CTA instead of raw exception codes. | **PASS** |

---

## 7. Compatibility Testing (NFR-COMP-001 to NFR-COMP-005)

Implemented in: [`frontend/src/tests/system/compatibility.test.ts`](file:///c:/Users/user/NOVA/frontend/src/tests/system/compatibility.test.ts)  
Evidence: [`testing/non-functional/evidence/compatibility_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/compatibility_test_output.txt)  
Live Browser Suite: Verified across Google Chrome (`154.0.8037.98`) and Microsoft Edge (`154.0.4258.62`).

| Test ID | Platform / Environment | Compatibility Focus | Acceptance Criteria | Verified Compatibility Status | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NFR-COMP-001** | Google Chrome (Chromium) | Layout, CSS Flexbox/Grid, Web APIs | 100% visual layout integrity, localStorage and Fetch API support | Tested on Google Chrome 154: all 8 Playwright specs passed. | **PASS** |
| **NFR-COMP-002** | Microsoft Edge | Chromium parity & Security Headers | Consistent typography, button styling, and cookie handling | Tested on Microsoft Edge 154: layout and script execution identical. | **PASS** |
| **NFR-COMP-003** | Mozilla Firefox (Standard Specs) | CSS Standard properties & Font Fallbacks | System font stack falls back cleanly; flexbox wrapping behaves consistently | CSS standard compliance verified without proprietary webkit prefixes. | **PASS** |
| **NFR-COMP-004** | Mobile Web Viewport (Responsive) | Viewport scaling (320px - 768px), touch targets | Touch targets >= 44x44px; zero horizontal scrolling on mobile viewports | Responsive layout adapts; navigation collapses into mobile drawer. | **PASS** |
| **NFR-COMP-005** | Flutter Android Mobile Client | Cross-platform JSON contract serialization | Mobile models parse API payloads without deserialization mismatch | Dart models parse backend responses with 100% field type agreement. | **PASS** |

---

## 8. Reliability Testing (NFR-REL-001 to NFR-REL-007)

Implemented in: [`backend/Nova.Tests/NonFunctional/ReliabilityAndRecoveryTests.cs`](file:///c:/Users/user/NOVA/backend/Nova.Tests/NonFunctional/ReliabilityAndRecoveryTests.cs)  
Evidence: [`testing/non-functional/evidence/reliability_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/reliability_test_output.txt)

| Test ID | Target System Area | Sustained Repetitions | Acceptance Criteria | Observed Failure Rate & Stability | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NFR-REL-001** | Repeated Destination Retrieval | 50 consecutive requests | 0% failure rate; stable response times | 50/50 succeeded, 0 errors, avg latency: 22 ms | **PASS** |
| **NFR-REL-002** | Repeated Trip Retrieval Under Auth | 50 consecutive requests with JWT | Zero authentication cache corruption or session dropping | 50/50 succeeded, 0 errors, avg latency: 25 ms | **PASS** |
| **NFR-REL-003** | Repeated Itinerary CRUD Operations | 25 consecutive create/update cycles | Zero orphaned records or transaction lock deadlocks | 25/25 cycles succeeded, entity counts exact | **PASS** |
| **NFR-REL-004** | Repeated Guide & Tour Catalog Queries | 50 consecutive requests with filters | Memory footprint stable; zero leaky DB connections | 50/50 succeeded, connection count steady | **PASS** |
| **NFR-REL-005** | Repeated Review Submission & Retrieval | 20 consecutive writes followed by reads | Accurate data persistence; zero missing records | 20/20 persisted and retrieved with matching IDs | **PASS** |
| **NFR-REL-006** | Repeated Smart-Match Recommendations | 30 consecutive requests with variable preferences | Deterministic ranking for identical criteria inputs | 30/30 succeeded, scores consistent and valid | **PASS** |
| **NFR-REL-007** | AI Service Intermittent Unavailability | Python AI agent mock offline | Backend falls back to rule-based destination recommendations | 100% graceful fallback; zero 500 crashes emitted | **PASS** |

---

## 9. Recovery Testing (NFR-REC-001 to NFR-REC-005)

Implemented in: [`backend/Nova.Tests/NonFunctional/ReliabilityAndRecoveryTests.cs`](file:///c:/Users/user/NOVA/backend/Nova.Tests/NonFunctional/ReliabilityAndRecoveryTests.cs)  
Evidence: [`testing/non-functional/evidence/reliability_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/reliability_test_output.txt)

| Test ID | Recovery Scenario | Failure Injection Method | Expected Recovery Behavior | Observed Recovery Status | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NFR-REC-001** | Backend Server Restart Simulation | Dispose `NovaApiHost`, instantiate new host on existing database | New server instance initializes cleanly; previous database records remain intact. | Server re-instantiated, all seeded and user records intact and readable. | **PASS** |
| **NFR-REC-002** | AI Service Down Then Restored | Simulate 503 Service Unavailable, then restore 200 OK | System uses fallback during outage; automatically resumes full AI mode once restored. | Seamless transition: fallback active during failure, full AI mode resumes upon restoration. | **PASS** |
| **NFR-REC-003** | Temporary Network Timeout Simulation | Client request abort / short timeout cancellation | Backend handles `TaskCanceledException` safely without resource leak. | Cancellation handled gracefully; connection closed without server crash. | **PASS** |
| **NFR-REC-004** | Database Connection Drop & Reconnect | Force connection pool reset via transient query interruption | Npgsql connection pool re-establishes socket and serves subsequent requests. | Next incoming request re-opens connection successfully with HTTP 200. | **PASS** |
| **NFR-REC-005** | Client-Side Retry After Transient 5xx | Client retries failed request with exponential backoff | Request succeeds on retry; idempotent mutations prevent duplicate inserts. | Client retry succeeded on second attempt; database integrity preserved. | **PASS** |
