# NOVA Smart Tourism Platform - Integration & End-to-End (E2E) Testing

## 1. Executive Summary

This directory documents the **Whole-System Integration and End-to-End Testing Phase** for the NOVA Smart Tourism Platform. 

Unlike component-level tests, the tests documented here validate cross-boundary interactions, data cascade consistency, end-to-end consumer and operator business journeys, and multi-platform data contracts across:
- **Backend Services:** .NET 8 Web API (`Nova.Api`)
- **Database Layer:** Isolated PostgreSQL template clones managed via `PgTestDatabase`
- **Web Frontend:** React 19 / Vite single-page application
- **Mobile Client:** Flutter Dart application
- **AI Agent Service:** Python FastAPI / rule-based AI planning agents

All 32 backend system integration tests and 8 browser E2E tests have been implemented, executed, and verified with **100% pass rates**.

---

## 2. Testing Scope & Organization

The suite covers three major integration dimensions:

```
testing/integration-e2e/
├── README.md                     # Comprehensive overview, execution guide, and summary
├── TEST_CASE_MAPPING.md          # 1-to-1 test case traceability matrix with steps & results
├── DEFECTS.md                    # Defect discovery, root cause analysis, and resolution log
└── evidence/                     # Authentic command execution outputs
    ├── api_integration_output.txt
    ├── cross_platform_output.txt
    ├── e2e_workflow_output.txt
    ├── flutter_integration_output.txt
    └── playwright_test_output.txt
```

### Test Categories
1. **Complete Business-Workflow Testing (`E2E-001` through `E2E-015`)**
   - Validates multi-step traveler journeys from user onboarding, destination discovery, trip planning, guide booking, and review submission, as well as administrative approval and tour operation lifecycles.
2. **API Integration Testing (`API-INT-001` through `API-INT-010`)**
   - Validates cross-entity referential integrity, foreign key cascading, authentication token propagation across distinct modules, concurrency conflicts, and uniform RFC 7807 problem details.
3. **Cross-Platform Workflow Testing (`PLAT-INT-001` through `PLAT-INT-007`)**
   - Validates schema parity, JSON serialization alignment between C# .NET, TypeScript React, and Dart Flutter, shared JWT session viability, and offline mutation reconciliations.
4. **Browser End-to-End Testing (Playwright)**
   - Validates live DOM rendering, navigation transitions, interactive form validations, and responsiveness in Google Chrome and Microsoft Edge.

---

## 3. Test Execution Results Summary

| Test Area | Suite / File | Planned | Executed | Passed | Failed | Pass Rate | Evidence Log |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Complete Business Workflows** | [`E2EWorkflowTests.cs`](file:///c:/Users/user/NOVA/backend/Nova.Tests/SystemIntegration/E2EWorkflowTests.cs) | 15 | 15 | 15 | 0 | 100% | [`e2e_workflow_output.txt`](file:///c:/Users/user/NOVA/testing/integration-e2e/evidence/e2e_workflow_output.txt) |
| **API Cross-Component Integration** | [`ApiIntegrationTests.cs`](file:///c:/Users/user/NOVA/backend/Nova.Tests/SystemIntegration/ApiIntegrationTests.cs) | 10 | 10 | 10 | 0 | 100% | [`api_integration_output.txt`](file:///c:/Users/user/NOVA/testing/integration-e2e/evidence/api_integration_output.txt) |
| **Cross-Platform Workflows** | [`CrossPlatformTests.cs`](file:///c:/Users/user/NOVA/backend/Nova.Tests/SystemIntegration/CrossPlatformTests.cs) | 7 | 7 | 7 | 0 | 100% | [`cross_platform_output.txt`](file:///c:/Users/user/NOVA/testing/integration-e2e/evidence/cross_platform_output.txt) |
| **Browser End-to-End (Playwright)** | `frontend/e2e/*.spec.ts` | 8 | 8 | 8 | 0 | 100% | [`playwright_test_output.txt`](file:///c:/Users/user/NOVA/testing/integration-e2e/evidence/playwright_test_output.txt) |
| **Mobile Cross-Platform Integration** | `mobile/test/**` | 46 | 44 | 44 | 0 (2 skip) | 100% | [`flutter_integration_output.txt`](file:///c:/Users/user/NOVA/testing/integration-e2e/evidence/flutter_integration_output.txt) |
| **TOTAL** | | **86** | **84** | **84** | **0** | **100%** | |

*Note: 2 tests skipped in Flutter suite reflect documented mobile architectural scope (Tour Package / Tour Operation management is restricted to operator web portal).*

---

## 4. How to Execute the Tests

### 4.1 Backend System Integration Suites
Execute all integration suites using the .NET test runner:
```powershell
# Run all 32 System Integration tests
dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~Nova.Tests.SystemIntegration" --logger "console;verbosity=normal"

# Run individual suites
dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~Nova.Tests.SystemIntegration.E2EWorkflowTests"
dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~Nova.Tests.SystemIntegration.ApiIntegrationTests"
dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~Nova.Tests.SystemIntegration.CrossPlatformTests"
```

### 4.2 Browser End-to-End Tests (Playwright)
Run the Playwright test suite against the live Vite development server:
```powershell
cd frontend
# Run on Google Chrome
npx playwright test --project="Google Chrome"

# Run on Microsoft Edge
npx playwright test --project="msedge"

# Run all configured browser engines
npx playwright test
```

### 4.3 Mobile Client Integration Tests (Flutter)
Execute the Dart test runner covering mobile data contracts:
```powershell
cd mobile
flutter test test/guides/ test/trips/ test/reviews/
```

---

## 5. Architectural Findings & Verified Boundaries

1. **Role-Based Itinerary Approval Boundary (`E2E-013`):**
   - Regular tourists (`Role = Tourist / USER`) can create and modify itineraries, but are prohibited from approving their own itinerary via `POST /api/itineraries/{id}/approve` (enforces `[Authorize(Roles = "TourismOperator,Admin,ADMIN")]`). This guarantees commercial governance.
2. **Dedicated Tour Operation Lifecycle Status Patching (`E2E-014`):**
   - Updating tour operations status utilizes `PATCH /api/v1/tour-operations/{id}/status` taking `UpdateTourOperationStatusRequest`. This avoids full entity replacement side-effects.
3. **Availability Serialization Semantics (`DEF-INT-001`):**
   - .NET 8 `System.Text.Json` strictly binds `DateOnly` ("yyyy-MM-dd") and `TimeOnly` ("HH:mm:ss"). Web and mobile clients adhere to this ISO sub-format rather than sending full datetime stamps.
4. **Isolated PostgreSQL Template Cloning:**
   - Tests execute against transient, isolated PostgreSQL databases created on-the-fly from template databases (`nova_test_template`), providing full isolation without cross-test data pollution.

---

## 6. Traceability & Artifact Links

- Comprehensive Test Case Matrix: [TEST_CASE_MAPPING.md](file:///c:/Users/user/NOVA/testing/integration-e2e/TEST_CASE_MAPPING.md)
- Defect Investigation & Resolution Log: [DEFECTS.md](file:///c:/Users/user/NOVA/testing/integration-e2e/DEFECTS.md)
- Raw Command Execution Evidence: [testing/integration-e2e/evidence/](file:///c:/Users/user/NOVA/testing/integration-e2e/evidence/)
