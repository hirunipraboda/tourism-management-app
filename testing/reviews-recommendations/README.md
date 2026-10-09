# Reviews & Recommendation Management Automated Testing

## Scope
This automated test suite covers the end-to-end verification of the **Reviews & Recommendation Management** component of the NOVA Smart Tourism Platform across all architectural tiers:

1. **Review Management**:
   - Creating reviews with ratings (1–5 scale), textual comments, and destination references.
   - Retrieving global, filtered, and authenticated user-specific reviews ("My Reviews").
   - Empty state handling for users without review history.
   - Updating reviews with strict user ownership validation.
   - Deleting reviews with strict user ownership authorization.
   - Helpful vote incrementing, status recording, and toggle rules.

2. **Review Moderation**:
   - Admin review listing queue for pending, published, and flagged reviews.
   - Moderation status updates (`Pending`, `Published`, `Hidden`, `Flagged`).
   - Role-based access control protecting moderation endpoints (`AdminOnly` policy).
   - Graceful rejection of unauthorized or non-admin moderation attempts.

3. **Recommendation Management**:
   - Dynamic smart-match recommendations (`POST /api/v1/recommendations/smart-match`) based on user preferences (destination, interests, budget, pace, environment).
   - Recommendation catalog listing (`GET /api/v1/recommendations`).
   - Fallback logic and validation for empty or malformed preference requests.
   - Explicit architectural boundary: dynamic synthesis on-demand (no static DB table rows).

4. **AI Recommendation / RAG / FAISS**:
   - Python LangGraph AI recommendation agent (`/agents/recommendations`).
   - Retrieval-Augmented Generation (RAG) over verified tourist reviews knowledge base.
   - FAISS vector store similarity retrieval and metadata preservation.
   - Multi-factor scoring (Interest Match 35 pts, Environment Match 30 pts, Sentiment Evidence 20 pts, Budget Feasibility 15 pts).
   - Robustness testing against malformed outputs, service unavailability fallbacks, deterministic consistency, and prompt injection safety.

---

## Testing Layers & Execution Summary

| Layer | Framework / Runtime | Total | Executed | Passed | Failed | N/A | Pass Rate |
|---|---|---:|---:|---:|---:|---:|---:|
| **Backend API** | .NET 8 / ASP.NET Core TestServer / xUnit / Moq / JWT | 33 | 33 | 33 | 0 | 0 | **100%** |
| **Database** | PostgreSQL 16 (isolated clone DB) / Npgsql EF Core | 14 | 9 | 9 | 0 | 5 | **100%** |
| **React Web** | React 19 / TypeScript / Node.js 24 (`node:test`) | 20 | 20 | 20 | 0 | 0 | **100%** |
| **Flutter Mobile** | Flutter 3.47.5 / Dart 3.x / `flutter_test` | 15 | 15 | 15 | 0 | 0 | **100%** |
| **Python AI / RAG** | Python 3.11 / pytest / FAISS / LangGraph / Pydantic | 12 | 12 | 12 | 0 | 0 | **100%** |
| **TOTAL** | **Comprehensive Full-Stack Test Suite** | **94** | **89** | **89** | **0** | **5** | **100%** |

*Note on Database N/A (5 cases):* As verified from codebase inspection, recommendations are generated dynamically on-demand by the AI RAG engine and fallback synthesis algorithms; they are intentionally not persisted as static table rows in PostgreSQL. In accordance with testing guidelines, DB-REC-001 through DB-REC-005 are classified as **NOT APPLICABLE** without creating artificial database tables.

---

## Tools Used

Only tools and frameworks verified and actively utilized in the test suite are listed:
- **.NET 8 SDK** / **C# 12**
- **xUnit 2.5.3**
- **Microsoft.AspNetCore.TestHost 8.0.11**
- **Moq 4.20.72**
- **Npgsql.EntityFrameworkCore.PostgreSQL 8.0.11**
- **PostgreSQL 16** (Local port 5432, cloned template databases via `PgTestDatabase`)
- **React 19** / **TypeScript 5.x**
- **Node.js 24** (`node:test`, `node:assert/strict`)
- **Flutter 3.47.5** / **Dart 3.x** (`flutter_test`)
- **Python 3.11.9**
- **pytest 9.1.1**
- **FAISS** (`faiss-cpu` / `langchain_community.vectorstores.FAISS`)
- **Pydantic 2.x** / **LangGraph**

---

## Test File Locations

```text
backend/Nova.Tests/Reviews/
    ReviewsControllerTests.cs                (17 API tests: API-REV-001 to API-REV-017)
    ReviewModerationTests.cs                 (6 API tests: API-MOD-001 to API-MOD-006)
    RecommendationsControllerTests.cs        (10 API tests: API-REC-001 to API-REC-010)
    ReviewsRecommendationDatabaseTests.cs   (10 DB tests: DB-REV-001 to DB-REV-009 + DB-REC-ARCH)

frontend/src/tests/reviews/
    review_management.test.ts                (9 Web tests: WEB-REV-001 to WEB-REV-009)
    review_moderation.test.ts                (4 Web tests: WEB-MOD-001 to WEB-MOD-004)
    recommendation.test.ts                   (7 Web tests: WEB-REC-001 to WEB-REC-007)

mobile/test/reviews/
    review_test.dart                         (8 Mobile tests: MOB-REV-001 to MOB-REV-008)
    recommendation_test.dart                 (7 Mobile tests: MOB-REC-001 to MOB-REC-007)

ai-agents/tests/recommendations/
    test_recommendations.py                  (8 AI tests: AI-REC-001..004, 006, 010..012)
    test_rag_retrieval.py                    (2 AI tests: AI-REC-005, AI-REC-007)
    test_recommendation_failures.py          (2 AI tests: AI-REC-008, AI-REC-009)

testing/reviews-recommendations/
    README.md
    TEST_CASE_MAPPING.md
    DEFECTS.md
    evidence/
        backend_test_output.txt
        database_test_output.txt
        react_test_output.txt
        flutter_test_output.txt
        ai_test_output.txt
        regression_test_output.txt
```

---

## Exact Execution Commands

### 1. Backend API & Database Tests
Ensure local PostgreSQL is accessible on port 5432. From the repository root:
```bash
# Run all Reviews & Recommendations backend tests (API + DB)
dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~Nova.Tests.Reviews"

# Run only isolated PostgreSQL database persistence tests
dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~ReviewsRecommendationDatabaseTests"
```
*Expected Result:* 43 passed, 0 failed.

### 2. React Web Frontend Tests
From the `frontend` directory:
```bash
cd frontend

# Run entire frontend suite including reviews
npm test

# Run specifically Reviews & Recommendations frontend tests
node --test src/tests/reviews/*.test.ts
```
*Expected Result:* 76 passed (56 existing + 20 Reviews/Recommendations), 0 failed.

### 3. Flutter Mobile Tests
From the `mobile` directory:
```bash
cd mobile

# Run mobile Reviews & Recommendations suite
flutter test test/reviews/
```
*Expected Result:* 15 passed, 0 failed.

### 4. Python AI Service Tests
From the `ai-agents` directory:
```bash
cd ai-agents

# Run AI recommendation, RAG, and FAISS test suite
pytest tests/recommendations/ -v
```
*Expected Result:* 12 passed, 0 failed.

### 5. Regression Verification Tests
```bash
# Backend Guide & Tour tests
dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~Nova.Tests.Guides"

# Backend Trip & Itinerary tests
dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~TripItinerary"

# Mobile Trips & Guides tests
cd mobile && flutter test test/trips/
cd mobile && flutter test test/guides/
```
*Expected Result:* All existing suites pass with 0 regressions.
