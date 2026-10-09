# Comprehensive Test Case Traceability Mapping Matrix: Reviews & Recommendation Management

**Project:** NOVA Smart Tourism Platform  
**Component:** Reviews & Recommendation Management Component  
**Date:** 2026-10-08  
**Total Test Cases Defined:** 94 Test Cases  
- Backend API: 33 (17 Reviews, 6 Moderation, 10 Recommendations)
- Database: 14 (9 Reviews, 5 Recommendations)
- React Web: 20 (9 Reviews, 4 Moderation, 7 Recommendations)
- Flutter Mobile: 15 (8 Reviews, 7 Recommendations)
- Python AI / RAG: 12 (AI Recommendations, RAG, FAISS Retrieval, Adversarial / Fallback)

**Execution Summary:** 89 Executed, 89 Passed, 0 Failed, 5 Not Applicable (Dynamic Recommendation Persistence Rule)  
**Overall Execution Pass Rate:** 100% of applicable cases verified.

---

## 1. Summary of Execution by System Layer

| Layer | Framework & Tools | Total Defined | Executed | Passed | Failed | N/A | Pass Rate | Test Evidence File |
|---|---|---:|---:|---:|---:|---:|---:|---|
| **Backend API** | .NET 8 / ASP.NET Core TestHost / xUnit / Moq / JWT | 33 | 33 | 33 | 0 | 0 | **100%** | `backend_test_output.txt` |
| **Database** | PostgreSQL 16 (isolated clone DB) / EF Core 8 | 14 | 9 | 9 | 0 | 5 | **100%** | `database_test_output.txt` |
| **React Web** | React 19 / TypeScript / Node.js 24 (`node:test`) | 20 | 20 | 20 | 0 | 0 | **100%** | `react_test_output.txt` |
| **Flutter Mobile** | Flutter 3.47.5 / Dart 3.x / `flutter_test` | 15 | 15 | 15 | 0 | 0 | **100%** | `flutter_test_output.txt` |
| **Python AI / RAG** | Python 3.11 / pytest / FAISS / LangGraph | 12 | 12 | 12 | 0 | 0 | **100%** | `ai_test_output.txt` |
| **TOTAL** | **Full Stack System Layers** | **94** | **89** | **89** | **0** | **5** | **100%** | **All layers verified** |

*Note on Database N/A Status (DB-REC-001 through DB-REC-005):*  
In the NOVA platform, tourist recommendations are dynamically synthesized on-demand using vector similarity retrieval over tourist reviews (RAG/FAISS) and algorithmic matching against preferences. They are purposely not saved as redundant rows in PostgreSQL tables. Per testing instructions, these 5 persistence tests are marked **NOT APPLICABLE** rather than fabricating artificial database entities.

---

## 2. Traceability Matrix

### 2.1 Backend API — Review Management (API-REV-001 to API-REV-017)

| Test Case ID | Component | Layer | Test Scenario | Test Type | Test File | Execution Command | Actual Result | Status |
|---|---|---|---|---|---|---|---|---|
| **API-REV-001** | Review Management | Backend API | Create a review with valid information | Functional / Integration | `ReviewsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REV_001"` | Review created successfully with HTTP 200 OK and assigned ID | **PASS** |
| **API-REV-002** | Review Management | Backend API | Create a review with missing required fields | Validation / Negative | `ReviewsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REV_002"` | Missing fields rejected with HTTP 400 Bad Request | **PASS** |
| **API-REV-003** | Review Management | Backend API | Create a review with invalid rating value (< 1 or > 5) | Validation / Boundary | `ReviewsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REV_003"` | Rating outside 1-5 rejected with HTTP 400 Bad Request (DEF-REV-001 fixed) | **PASS** |
| **API-REV-004** | Review Management | Backend API | Create a review with empty or whitespace comment | Validation / Negative | `ReviewsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REV_004"` | Empty comment rejected with HTTP 400 Bad Request | **PASS** |
| **API-REV-005** | Review Management | Backend API | Retrieve global list of reviews | Functional / Query | `ReviewsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REV_005"` | Reviews catalog returned with HTTP 200 OK | **PASS** |
| **API-REV-006** | Review Management | Backend API | Retrieve reviews filtered by destination ID and rating | Query / Filtering | `ReviewsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REV_006"` | Only matching reviews for target destination returned | **PASS** |
| **API-REV-007** | Review Management | Backend API | Retrieve authenticated user's reviews using My Reviews | Functional / Query | `ReviewsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REV_007"` | Reviews created by authenticated user returned | **PASS** |
| **API-REV-008** | Review Management | Backend API | Retrieve My Reviews when user has 0 reviews | Boundary / Empty State | `ReviewsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REV_008"` | Empty list `[]` returned without leaking other users' reviews (DEF-REV-003 fixed) | **PASS** |
| **API-REV-009** | Review Management | Backend API | Update an existing review owned by authenticated user | Functional / Mutation | `ReviewsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REV_009"` | Review fields updated successfully with HTTP 200 OK | **PASS** |
| **API-REV-010** | Review Management | Backend API | Update a review with invalid rating information | Validation / Boundary | `ReviewsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REV_010"` | Invalid rating on update rejected with HTTP 400 Bad Request | **PASS** |
| **API-REV-011** | Review Management | Backend API | Attempt to update another traveler's review | Security / Ownership | `ReviewsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REV_011"` | Unauthorized edit rejected with HTTP 403 Forbidden (DEF-REV-002 fixed) | **PASS** |
| **API-REV-012** | Review Management | Backend API | Delete an existing review owned by user | Functional / Deletion | `ReviewsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REV_012"` | Review deleted successfully with HTTP 200 OK / 204 NoContent | **PASS** |
| **API-REV-013** | Review Management | Backend API | Attempt to delete another user's review | Security / Ownership | `ReviewsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REV_013"` | Unauthorized deletion rejected with HTTP 403 Forbidden (DEF-REV-002 fixed) | **PASS** |
| **API-REV-014** | Review Management | Backend API | Delete a non-existing review ID | Boundary / Negative | `ReviewsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REV_014"` | Non-existing ID returns HTTP 404 Not Found | **PASS** |
| **API-REV-015** | Review Management | Backend API | Mark an existing review as helpful | Functional / Engagement | `ReviewsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REV_015"` | Helpful count incremented and new total returned | **PASS** |
| **API-REV-016** | Review Management | Backend API | Mark a non-existing review as helpful | Boundary / Negative | `ReviewsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REV_016"` | Non-existing review returns HTTP 404 Not Found | **PASS** |
| **API-REV-017** | Review Management | Backend API | Repeatedly mark the same review as helpful | Idempotency / State | `ReviewsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REV_017"` | Sequential votes processed according to toggle/increment rules | **PASS** |

---

### 2.2 Backend API — Review Moderation (API-MOD-001 to API-MOD-006)

| Test Case ID | Component | Layer | Test Scenario | Test Type | Test File | Execution Command | Actual Result | Status |
|---|---|---|---|---|---|---|---|---|
| **API-MOD-001** | Review Moderation | Backend API | Admin retrieves reviews for moderation queue | Administrative / Query | `ReviewModerationTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_MOD_001"` | Admin receives reviews with status and moderation metadata | **PASS** |
| **API-MOD-002** | Review Moderation | Backend API | Admin changes review to valid status (`Published`/`Hidden`/`Flagged`) | Administrative / Mutation | `ReviewModerationTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_MOD_002"` | Status updated successfully and persisted | **PASS** |
| **API-MOD-003** | Review Moderation | Backend API | Admin attempts to use invalid review status | Validation / Negative | `ReviewModerationTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_MOD_003"` | Unrecognized status rejected with HTTP 400 Bad Request | **PASS** |
| **API-MOD-004** | Review Moderation | Backend API | Admin attempts to moderate a non-existing review | Boundary / Negative | `ReviewModerationTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_MOD_004"` | Returns HTTP 404 Not Found | **PASS** |
| **API-MOD-005** | Review Moderation | Backend API | Non-admin attempts to access review moderation queue | Security / RBAC | `ReviewModerationTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_MOD_005"` | Access denied with HTTP 401 Unauthorized / 403 Forbidden | **PASS** |
| **API-MOD-006** | Review Moderation | Backend API | Non-admin attempts to change review status | Security / RBAC | `ReviewModerationTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_MOD_006"` | Unauthorized status change blocked with HTTP 403 Forbidden | **PASS** |

---

### 2.3 Backend API — Recommendations (API-REC-001 to API-REC-010)

| Test Case ID | Component | Layer | Test Scenario | Test Type | Test File | Execution Command | Actual Result | Status |
|---|---|---|---|---|---|---|---|---|
| **API-REC-001** | Recommendation | Backend API | Request smart-match recommendations with valid preferences | Functional / Query | `RecommendationsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REC_001"` | Matching recommendations returned with suitability scores | **PASS** |
| **API-REC-002** | Recommendation | Backend API | Request smart-match recommendations with missing/null body | Validation / Negative | `RecommendationsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REC_002"` | Null body handled with HTTP 400 Bad Request (DEF-REC-001 fixed) | **PASS** |
| **API-REC-003** | Recommendation | Backend API | Request recommendations with invalid rating (< 0 or > 5) | Validation / Boundary | `RecommendationsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REC_003"` | Invalid MinRating rejected with HTTP 400 Bad Request | **PASS** |
| **API-REC-004** | Recommendation | Backend API | Request smart-match using valid destination/interests | Functional / Query | `RecommendationsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REC_004"` | Recommendations filtered to requested destination criteria | **PASS** |
| **API-REC-005** | Recommendation | Backend API | Request smart-match with non-matching criteria | Boundary / Fallback | `RecommendationsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REC_005"` | Safe fallback recommendations or empty list returned without crashing | **PASS** |
| **API-REC-006** | Recommendation | Backend API | Retrieve recommendations catalog list | Functional / Query | `RecommendationsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REC_006"` | Full recommendation catalog returned with HTTP 200 OK | **PASS** |
| **API-REC-007** | Recommendation | Backend API | Retrieve recommendations for authenticated user | Functional / Query | `RecommendationsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REC_007"` | Verified user recommendations returned | **PASS** |
| **API-REC-008** | Recommendation | Backend API | Retrieve recommendations when catalog is empty | Boundary / Empty State | `RecommendationsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REC_008"` | Empty array `[]` returned with HTTP 200 OK | **PASS** |
| **API-REC-009** | Recommendation | Backend API | Send malformed recommendation request payload | Robustness / Negative | `RecommendationsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REC_009"` | Malformed JSON rejected with HTTP 400 Bad Request | **PASS** |
| **API-REC-010** | Recommendation | Backend API | Simulate recommendation AI service failure | Fault Tolerance / Resiliency | `RecommendationsControllerTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~API_REC_010"` | System uses verified review fallback without throwing unhandled exceptions | **PASS** |

---

### 2.4 Database Persistence — Reviews & Recommendations (DB-REV-001..009, DB-REC-001..005)

| Test Case ID | Component | Layer | Test Scenario | Test Type | Test File | Execution Command | Actual Result | Status |
|---|---|---|---|---|---|---|---|---|
| **DB-REV-001** | Review Management | Database | Verify new review record inserted into PostgreSQL | Data Persistence | `ReviewsRecommendationDatabaseTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~DB_REV_001"` | Review row created with generated primary key in `reviews` table | **PASS** |
| **DB-REV-002** | Review Management | Database | Verify review-user foreign key relationship | Relational Integrity | `ReviewsRecommendationDatabaseTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~DB_REV_002"` | Review navigation property resolves to valid `User` entity | **PASS** |
| **DB-REV-003** | Review Management | Database | Verify review content and rating persistence | Data Accuracy | `ReviewsRecommendationDatabaseTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~DB_REV_003"` | Stored Rating and Comment match submitted entity exactly | **PASS** |
| **DB-REV-004** | Review Management | Database | Verify review update persistence in PostgreSQL | Data Mutation | `ReviewsRecommendationDatabaseTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~DB_REV_004"` | Updated Comment and Rating persisted on `SaveChangesAsync` | **PASS** |
| **DB-REV-005** | Review Management | Database | Verify review deletion from database | Data Lifecycle | `ReviewsRecommendationDatabaseTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~DB_REV_005"` | Review row successfully removed from `reviews` table | **PASS** |
| **DB-REV-006** | Review Management | Database | Verify review moderation status persistence | Data Mutation | `ReviewsRecommendationDatabaseTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~DB_REV_006"` | Status column updated to `Published` / `Hidden` / `Flagged` | **PASS** |
| **DB-REV-007** | Review Management | Database | Verify helpful action counter persistence | Data Persistence | `ReviewsRecommendationDatabaseTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~DB_REV_007"` | HelpfulCount column increments accurately in PostgreSQL | **PASS** |
| **DB-REV-008** | Review Management | Database | Verify invalid user-review foreign key violation | Schema Constraints | `ReviewsRecommendationDatabaseTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~DB_REV_008"` | Non-existing user ID rejected with `DbUpdateException` | **PASS** |
| **DB-REV-009** | Review Management | Database | Verify moderated review retrieval by status | Query Integrity | `ReviewsRecommendationDatabaseTests.cs` | `dotnet test backend/Nova.Tests/Nova.Tests.csproj -c Release --filter "FullyQualifiedName~DB_REV_009"` | EF Core query filters published vs hidden reviews correctly | **PASS** |
| **DB-REC-001** | Recommendation | Database | Verify recommendation row insertion | Persistence | *N/A (Architecture Rule)* | *N/A* | Recommendations generated dynamically; not stored in DB table | **N/A** |
| **DB-REC-002** | Recommendation | Database | Verify recommendation-user relationship | Relational Integrity | *N/A (Architecture Rule)* | *N/A* | Dynamic recommendation synthesis; no static foreign key table | **N/A** |
| **DB-REC-003** | Recommendation | Database | Verify recommendation destination relationship | Relational Integrity | *N/A (Architecture Rule)* | *N/A* | Dynamic recommendation synthesis; no static foreign key table | **N/A** |
| **DB-REC-004** | Recommendation | Database | Verify stored recommendation retrieval | Query Integrity | *N/A (Architecture Rule)* | *N/A* | Recommendations calculated on-demand via AI RAG/feedback | **N/A** |
| **DB-REC-005** | Recommendation | Database | Verify recommendation data consistency | Data Consistency | *N/A (Architecture Rule)* | *N/A* | Recommendations computed at query time; not persisted in DB | **N/A** |

---

### 2.5 React Web Frontend — Reviews & Recommendations (WEB-REV, WEB-MOD, WEB-REC)

| Test Case ID | Component | Layer | Test Scenario | Test Type | Test File | Execution Command | Actual Result | Status |
|---|---|---|---|---|---|---|---|---|
| **WEB-REV-001** | Review Management | React Web | Open reviews section; display reviews list | UI / Query | `review_management.test.ts` | `npm test` (inside `frontend`) | Reviews loaded and rendered in catalog view | **PASS** |
| **WEB-REV-002** | Review Management | React Web | Display review content, rating, and highlight breakdown | UI / Rendering | `review_management.test.ts` | `npm test` (inside `frontend`) | Review cards display stars, author, text, and highlights | **PASS** |
| **WEB-REV-003** | Review Management | React Web | Submit a valid review | UI / Mutation | `review_management.test.ts` | `npm test` (inside `frontend`) | Review payload submitted and added to reviews list | **PASS** |
| **WEB-REV-004** | Review Management | React Web | Submit review with missing/invalid information | UI / Validation | `review_management.test.ts` | `npm test` (inside `frontend`) | Validation prevents submission and shows input errors | **PASS** |
| **WEB-REV-005** | Review Management | React Web | Edit own review | UI / Mutation | `review_management.test.ts` | `npm test` (inside `frontend`) | Updated rating and comment persist to UI state | **PASS** |
| **WEB-REV-006** | Review Management | React Web | Delete own review | UI / Deletion | `review_management.test.ts` | `npm test` (inside `frontend`) | Review removed from display upon deletion confirmation | **PASS** |
| **WEB-REV-007** | Review Management | React Web | Attempt unauthorized review modification | UI / Security | `review_management.test.ts` | `npm test` (inside `frontend`) | Modification blocked for reviews not authored by current user | **PASS** |
| **WEB-REV-008** | Review Management | React Web | Mark a review as helpful | UI / Interaction | `review_management.test.ts` | `npm test` (inside `frontend`) | Helpful counter increments and UI reflects voted state | **PASS** |
| **WEB-REV-009** | Review Management | React Web | Open My Reviews | UI / Filtering | `review_management.test.ts` | `npm test` (inside `frontend`) | Only current user's submitted reviews rendered | **PASS** |
| **WEB-MOD-001** | Review Moderation | React Web | Open admin review moderation queue | UI / Admin | `review_moderation.test.ts` | `npm test` (inside `frontend`) | Moderation queue displays reviews requiring moderation | **PASS** |
| **WEB-MOD-002** | Review Moderation | React Web | Approve/change review status to Published | UI / Admin | `review_moderation.test.ts` | `npm test` (inside `frontend`) | Review status updated to Published in moderation view | **PASS** |
| **WEB-MOD-003** | Review Moderation | React Web | Reject/flag review status | UI / Admin | `review_moderation.test.ts` | `npm test` (inside `frontend`) | Review status updated to Flagged/Hidden in moderation view | **PASS** |
| **WEB-MOD-004** | Review Moderation | React Web | Attempt moderation as non-admin user | UI / Security | `review_moderation.test.ts` | `npm test` (inside `frontend`) | Moderation interface blocked with permission error | **PASS** |
| **WEB-REC-001** | Recommendation | React Web | Open recommendation section | UI / Query | `recommendation.test.ts` | `npm test` (inside `frontend`) | Recommendation catalog loads destination suggestions | **PASS** |
| **WEB-REC-002** | Recommendation | React Web | Request smart-match recommendations with valid preferences | UI / Functional | `recommendation.test.ts` | `npm test` (inside `frontend`) | Recommended items returned matching selected preferences | **PASS** |
| **WEB-REC-003** | Recommendation | React Web | Submit incomplete recommendation preferences | UI / Validation | `recommendation.test.ts` | `npm test` (inside `frontend`) | Incomplete inputs handled gracefully with smart defaults | **PASS** |
| **WEB-REC-004** | Recommendation | React Web | Submit invalid recommendation input | UI / Validation | `recommendation.test.ts` | `npm test` (inside `frontend`) | Invalid ratings/budget values sanitized before query | **PASS** |
| **WEB-REC-005** | Recommendation | React Web | Display recommendation results with score breakdown | UI / Rendering | `recommendation.test.ts` | `npm test` (inside `frontend`) | Renders suitability score and transparent factor breakdown | **PASS** |
| **WEB-REC-006** | Recommendation | React Web | Handle empty recommendation results | UI / Empty State | `recommendation.test.ts` | `npm test` (inside `frontend`) | Renders informative empty state with suggestions | **PASS** |
| **WEB-REC-007** | Recommendation | React Web | Handle recommendation API failure | UI / Resiliency | `recommendation.test.ts` | `npm test` (inside `frontend`) | Displays friendly error and fallback recommendations | **PASS** |

---

### 2.6 Flutter Mobile — Reviews & Recommendations (MOB-REV, MOB-REC)

| Test Case ID | Component | Layer | Test Scenario | Test Type | Test File | Execution Command | Actual Result | Status |
|---|---|---|---|---|---|---|---|---|
| **MOB-REV-001** | Review Management | Flutter Mobile | Open reviews section; parse and display reviews | Mobile UI / Model | `review_test.dart` | `flutter test test/reviews/review_test.dart` | Review models deserialized and list displayed correctly | **PASS** |
| **MOB-REV-002** | Review Management | Flutter Mobile | View review details and reviewer highlights | Mobile UI / Model | `review_test.dart` | `flutter test test/reviews/review_test.dart` | Rating, comment, author name, and date verified | **PASS** |
| **MOB-REV-003** | Review Management | Flutter Mobile | Submit a valid review | Mobile UI / Model | `review_test.dart` | `flutter test test/reviews/review_test.dart` | New ReviewDetailItem created with valid fields | **PASS** |
| **MOB-REV-004** | Review Management | Flutter Mobile | Submit invalid/incomplete review | Mobile Validation | `review_test.dart` | `flutter test test/reviews/review_test.dart` | Validation rejects rating < 1 or empty comment | **PASS** |
| **MOB-REV-005** | Review Management | Flutter Mobile | Edit own review | Mobile Mutation | `review_test.dart` | `flutter test test/reviews/review_test.dart` | `copyWith` produces updated review item accurately | **PASS** |
| **MOB-REV-006** | Review Management | Flutter Mobile | Delete own review | Mobile Deletion | `review_test.dart` | `flutter test test/reviews/review_test.dart` | Review removed from active list | **PASS** |
| **MOB-REV-007** | Review Management | Flutter Mobile | View My Reviews | Mobile Filtering | `review_test.dart` | `flutter test test/reviews/review_test.dart` | Filters only submissions authored by logged-in user | **PASS** |
| **MOB-REV-008** | Review Management | Flutter Mobile | Mark a review as helpful | Mobile Engagement | `review_test.dart` | `flutter test test/reviews/review_test.dart` | Helpful toggle updates helpful count and isHelpful state | **PASS** |
| **MOB-REC-001** | Recommendation | Flutter Mobile | Open recommendation section | Mobile UI / Model | `recommendation_test.dart` | `flutter test test/reviews/recommendation_test.dart` | Recommendation catalog loads and models parse correctly | **PASS** |
| **MOB-REC-002** | Recommendation | Flutter Mobile | Request recommendations with valid preferences | Mobile Query | `recommendation_test.dart` | `flutter test test/reviews/recommendation_test.dart` | Filters catalog by interests and destination | **PASS** |
| **MOB-REC-003** | Recommendation | Flutter Mobile | Submit incomplete preferences | Mobile Validation | `recommendation_test.dart` | `flutter test test/reviews/recommendation_test.dart` | Defaults applied gracefully without unhandled exceptions | **PASS** |
| **MOB-REC-004** | Recommendation | Flutter Mobile | Submit invalid preferences | Mobile Validation | `recommendation_test.dart` | `flutter test test/reviews/recommendation_test.dart` | Sanitizes negative budget and out-of-range rating | **PASS** |
| **MOB-REC-005** | Recommendation | Flutter Mobile | Display recommendation results with scores | Mobile UI / Model | `recommendation_test.dart` | `flutter test test/reviews/recommendation_test.dart` | Renders suitability score and breakdown string | **PASS** |
| **MOB-REC-006** | Recommendation | Flutter Mobile | Handle empty recommendation results | Mobile Empty State | `recommendation_test.dart` | `flutter test test/reviews/recommendation_test.dart` | Clean empty state handled without null crashes | **PASS** |
| **MOB-REC-007** | Recommendation | Flutter Mobile | Handle recommendation service failure | Mobile Resiliency | `recommendation_test.dart` | `flutter test test/reviews/recommendation_test.dart` | Safe fallback catalog returned during network fault | **PASS** |

---

### 2.7 Python AI Service — AI Recommendations, RAG & FAISS (AI-REC-001 to AI-REC-012)

| Test Case ID | Component | Layer | Test Scenario | Test Type | Test File | Execution Command | Actual Result | Status |
|---|---|---|---|---|---|---|---|---|
| **AI-REC-001** | AI / RAG / FAISS | Python AI Service | Generate recommendations with valid preferences | AI Functional | `test_recommendations.py` | `pytest tests/recommendations/ -v` | LangGraph agent executes and returns tailored recommendations | **PASS** |
| **AI-REC-002** | AI / RAG / FAISS | Python AI Service | Generate recommendations with missing preferences | AI Validation | `test_recommendations.py` | `pytest tests/recommendations/ -v` | Handles missing preferences gracefully using neutral defaults | **PASS** |
| **AI-REC-003** | AI / RAG / FAISS | Python AI Service | Generate recommendations for valid destination/interest | AI Functional | `test_recommendations.py` | `pytest tests/recommendations/ -v` | Recommendations match requested destination and category | **PASS** |
| **AI-REC-004** | AI / RAG / FAISS | Python AI Service | Verify recommendation response structure and schema | Schema Validation | `test_recommendations.py` | `pytest tests/recommendations/ -v` | Validated against Pydantic `RecommendationApiResponse` schema | **PASS** |
| **AI-REC-005** | AI / RAG / FAISS | Python AI Service | Verify FAISS / RAG retrieval over review knowledge base | Knowledge Retrieval | `test_rag_retrieval.py` | `pytest tests/recommendations/ -v` | FAISS vector store indexes reviews and preserves metadata | **PASS** |
| **AI-REC-006** | AI / RAG / FAISS | Python AI Service | Generate recommendations for distinct interests | AI Diversity | `test_recommendations.py` | `pytest tests/recommendations/ -v` | Recommendations differentiate between Nature and Culture | **PASS** |
| **AI-REC-007** | AI / RAG / FAISS | Python AI Service | Generate recommendations where no matching knowledge exists | AI Fallback | `test_rag_retrieval.py` | `pytest tests/recommendations/ -v` | Insufficient knowledge handled with general baseline suggestions | **PASS** |
| **AI-REC-008** | AI / RAG / FAISS | Python AI Service | Test malformed AI service response handling | Resiliency / Parsing | `test_recommendation_failures.py` | `pytest tests/recommendations/ -v` | Malformed JSON/partial responses handled without crash | **PASS** |
| **AI-REC-009** | AI / RAG / FAISS | Python AI Service | Test AI service unavailable / failure | Resiliency / Fallback | `test_recommendation_failures.py` | `pytest tests/recommendations/ -v` | System falls back to verified tourist reviews catalog | **PASS** |
| **AI-REC-010** | AI / RAG / FAISS | Python AI Service | Repeat the same recommendation request | Determinism / Consistency | `test_recommendations.py` | `pytest tests/recommendations/ -v` | Deterministic suitability score formula yields identical score | **PASS** |
| **AI-REC-011** | AI / RAG / FAISS | Python AI Service | Test recommendation relevance against preferences | Relevance Scoring | `test_recommendations.py` | `pytest tests/recommendations/ -v` | Preference-matched attractions score higher than mismatches | **PASS** |
| **AI-REC-012** | AI / RAG / FAISS | Python AI Service | Test prompt containing irrelevant or malicious instructions | Prompt Security | `test_recommendations.py` | `pytest tests/recommendations/ -v` | Agent maintains recommendation role; prompt injection blocked | **PASS** |
