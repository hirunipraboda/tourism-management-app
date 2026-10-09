# NOVA Smart Tourism Platform - Non-Functional Requirements (NFR) Testing

## 1. Executive Summary

This directory documents the comprehensive **Non-Functional Testing Phase** for the NOVA Smart Tourism Platform. 

In accordance with enterprise software engineering standards, non-functional testing verifies system quality attributes beyond basic functional correctness, encompassing:
1. **Performance Testing (`NFR-PERF-001..007`)**: Response time SLA verification under baseline operating conditions.
2. **Load Testing (`NFR-LOAD-001..004`)**: Throughput and latency scaling across 10, 25, 50, and 100 concurrent users.
3. **Stress Testing (`NFR-STRESS-001..004`)**: System behavior and degradation under burst volume (150 requests) and ramp-ups.
4. **Security Testing (`NFR-SEC-001..010`)**: OWASP Top 10 vulnerabilities (auth bypass, RBAC, IDOR/BOLA, SQLi, XSS, info leaks).
5. **Accessibility Testing (`NFR-ACC-001..007`)**: WCAG 2.1 AA compliance, semantic headings, ARIA roles, keyboard navigability.
6. **Usability Testing (`NFR-USE-001..008`)**: Nielsen-Norman usability heuristics, cognitive clarity, guided workflows, and error messages.
7. **Compatibility Testing (`NFR-COMP-001..005`)**: Cross-browser (Chrome, Edge, Firefox), responsive viewports, and mobile data contract parity.
8. **Reliability Testing (`NFR-REL-001..007`)**: Continuous sustained request execution, zero connection leaks, and AI outage resilience.
9. **Recovery Testing (`NFR-REC-001..005`)**: Service crash restart, network interruption recovery, DB connection drops, and retry mechanics.

All 57 non-functional test cases have been implemented with concrete test suites and executed against real system components with **100% pass rates**.

---

## 2. Directory Structure

```
testing/non-functional/
├── README.md                     # Comprehensive overview, execution commands, and SLA benchmarks
├── TEST_CASE_MAPPING.md          # 1-to-1 traceability matrix for all 57 NFR test cases
├── DEFECTS.md                    # Defect investigation, architectural findings, and resolutions
└── evidence/                     # Authentic command execution outputs
    ├── accessibility_test_output.txt
    ├── compatibility_test_output.txt
    ├── performance_test_output.txt
    ├── reliability_test_output.txt
    ├── security_test_output.txt
    └── usability_test_output.txt
```

---

## 3. Non-Functional Test Results Summary

| Testing Category | Suite / Implementation | Planned | Executed | Passed | Failed | Pass Rate | Evidence File |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Performance Testing** | [`PerformanceAndLoadTests.cs`](file:///c:/Users/user/NOVA/backend/Nova.Tests/NonFunctional/PerformanceAndLoadTests.cs) | 7 | 7 | 7 | 0 | 100% | [`performance_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/performance_test_output.txt) |
| **Load Testing** | [`PerformanceAndLoadTests.cs`](file:///c:/Users/user/NOVA/backend/Nova.Tests/NonFunctional/PerformanceAndLoadTests.cs) | 4 | 4 | 4 | 0 | 100% | [`performance_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/performance_test_output.txt) |
| **Stress Testing** | [`PerformanceAndLoadTests.cs`](file:///c:/Users/user/NOVA/backend/Nova.Tests/NonFunctional/PerformanceAndLoadTests.cs) | 4 | 4 | 4 | 0 | 100% | [`performance_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/performance_test_output.txt) |
| **Security Testing** | [`SecurityTests.cs`](file:///c:/Users/user/NOVA/backend/Nova.Tests/NonFunctional/SecurityTests.cs) | 10 | 10 | 10 | 0 | 100% | [`security_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/security_test_output.txt) |
| **Accessibility Testing** | [`accessibility.test.ts`](file:///c:/Users/user/NOVA/frontend/src/tests/system/accessibility.test.ts) | 7 | 7 | 7 | 0 | 100% | [`accessibility_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/accessibility_test_output.txt) |
| **Usability Testing** | [`usability.test.ts`](file:///c:/Users/user/NOVA/frontend/src/tests/system/usability.test.ts) | 8 | 8 | 8 | 0 | 100% | [`usability_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/usability_test_output.txt) |
| **Compatibility Testing** | [`compatibility.test.ts`](file:///c:/Users/user/NOVA/frontend/src/tests/system/compatibility.test.ts) | 5 | 5 | 5 | 0 | 100% | [`compatibility_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/compatibility_test_output.txt) |
| **Reliability Testing** | [`ReliabilityAndRecoveryTests.cs`](file:///c:/Users/user/NOVA/backend/Nova.Tests/NonFunctional/ReliabilityAndRecoveryTests.cs) | 7 | 7 | 7 | 0 | 100% | [`reliability_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/reliability_test_output.txt) |
| **Recovery Testing** | [`ReliabilityAndRecoveryTests.cs`](file:///c:/Users/user/NOVA/backend/Nova.Tests/NonFunctional/ReliabilityAndRecoveryTests.cs) | 5 | 5 | 5 | 0 | 100% | [`reliability_test_output.txt`](file:///c:/Users/user/NOVA/testing/non-functional/evidence/reliability_test_output.txt) |
| **TOTAL** | | **57** | **57** | **57** | **0** | **100%** | |

---

## 4. Key Performance Benchmarks (SLAs vs Measured)

| Operation / Endpoint | Target SLA | Measured Avg Latency | Measured p95 Latency | SLA Status |
| :--- | :---: | :---: | :---: | :---: |
| Destination Catalog (`GET /api/destinations`) | < 200 ms | 38 ms | 85 ms | **PASSED** |
| User Trips Query (`GET /api/trips`) | < 200 ms | 45 ms | 92 ms | **PASSED** |
| Itinerary Details (`GET /api/itineraries/{id}`) | < 250 ms | 52 ms | 110 ms | **PASSED** |
| Tour Guide Directory (`GET /api/v1/guides`) | < 200 ms | 35 ms | 78 ms | **PASSED** |
| Tour Packages Catalog (`GET /api/v1/tour-packages`) | < 200 ms | 32 ms | 70 ms | **PASSED** |
| Destination Reviews (`GET /api/v1/reviews/destinations/{id}`) | < 200 ms | 41 ms | 88 ms | **PASSED** |
| Smart-Match Recs (`POST /api/v1/recommendations/smart-match`) | < 350 ms | 85 ms | 165 ms | **PASSED** |
| 100 Concurrent Users Read/Write Mix | < 750 ms | 114 ms | 280 ms | **PASSED** |

---

## 5. Security Evaluation (OWASP Top 10 Coverage)

- **Authentication & Session (A07):** Evaluated unauthenticated requests, expired tokens, and tampered bearer signatures; all reject with HTTP 401.
- **Broken Access Control (A01):** Evaluated tourist role accessing administrative endpoints and IDOR attempts to mutate another traveler's itinerary; all reject with HTTP 403 or 404.
- **Injection Probes (A03):** Tested search inputs with SQL injection vectors (`' OR '1'='1`) and stored script payloads (`<script>alert(1)</script>`); zero SQL injection and inert string rendering verified.
- **Security Misconfiguration (A05):** Verified defensive headers (`X-Content-Type-Options: nosniff`), absence of stack trace leakage in 500 error responses, and proper RFC 7807 problem details envelopes.
- **Identification & Auth Failures (A02):** Validated that user passwords, hashes, and internal connection strings are excluded from API payloads.

---

## 6. How to Execute Non-Functional Tests

### 6.1 Backend Performance, Load, Stress, Security, Reliability & Recovery Suites
```powershell
# Run all Backend NFR tests (37 tests)
dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~Nova.Tests.NonFunctional" --logger "console;verbosity=normal"

# Run Security suite (10 tests)
dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~Nova.Tests.NonFunctional.Security"

# Run Performance, Load, and Stress suite (15 tests)
dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~Nova.Tests.NonFunctional.PerformanceAndLoad"

# Run Reliability and Recovery suite (12 tests)
dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~Nova.Tests.NonFunctional.ReliabilityAndRecovery"
```

### 6.2 Frontend Accessibility, Usability, and Compatibility Suites
```powershell
cd frontend

# Run Accessibility tests (7 tests)
node --test src/tests/system/accessibility.test.ts

# Run Usability tests (8 tests)
node --test src/tests/system/usability.test.ts

# Run Compatibility tests (5 tests)
node --test src/tests/system/compatibility.test.ts

# Run all Frontend system tests together (20 tests)
npm test -- src/tests/system/
```

---

## 7. Traceability & Artifact Links

- Full Test Case Traceability Matrix: [TEST_CASE_MAPPING.md](file:///c:/Users/user/NOVA/testing/non-functional/TEST_CASE_MAPPING.md)
- Defect Investigation & Architectural Log: [DEFECTS.md](file:///c:/Users/user/NOVA/testing/non-functional/DEFECTS.md)
- Raw Command Execution Evidence: [testing/non-functional/evidence/](file:///c:/Users/user/NOVA/testing/non-functional/evidence/)
