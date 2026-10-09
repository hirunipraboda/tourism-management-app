# Reviews & Recommendation Management — Defects Log

This document records the genuine defects discovered in the NOVA Reviews & Recommendation Management codebase during automated test development and execution, including root causes, fixes applied in production code, and retest verification results.

---

## Defects Summary Matrix

| Defect ID | Associated Test Cases | Severity | Layer | Description | Status |
|---|---|---|---|---|---|
| **DEF-REV-001** | API-REV-003, API-REV-010, WEB-REV-004 | High | Backend API | Rating boundary validation missing (ratings < 1 or > 5 accepted) | **CLOSED (Verified)** |
| **DEF-REV-002** | API-REV-011, API-REV-013, WEB-REV-007 | Critical | Backend API / Security | Authorization bypass: users could update/delete another traveler's reviews | **CLOSED (Verified)** |
| **DEF-REV-003** | API-REV-007, API-REV-008, WEB-REV-009 | Medium | Backend API | "My Reviews" returned other users' mock reviews when user had 0 reviews | **CLOSED (Verified)** |
| **DEF-REC-001** | API-REC-002, API-REC-003, WEB-REC-004 | Medium | Backend API | Missing validation for null request and invalid `MinRating` range | **CLOSED (Verified)** |

---

## Detailed Defect Records

### DEF-REV-001: Rating Boundary Validation Missing in Review Endpoints
- **Defect ID:** DEF-REV-001
- **Associated Test Cases:** API-REV-003, API-REV-010, WEB-REV-004, MOB-REV-004
- **Severity:** High
- **Layer:** Backend API (`ReviewsController.cs`)
- **Description:** `POST /api/v1/reviews` and `PUT /api/v1/reviews/{id}` accepted ratings outside the valid 1–5 star rating scale (e.g. 0, -1, or 10), leading to corrupt rating calculations and distorted attraction score calculations.
- **Root Cause:** Missing explicit validation bounds in `ReviewsController.CreateReview` and `UpdateReview`.
- **Fix Applied:** Added `if (request.Rating < 1 || request.Rating > 5) return BadRequest("Rating must be between 1 and 5.");` in both creation and update actions in `backend/Nova.Api/Controllers/ReviewsController.cs`.
- **Retest Result:** Automated test `API-REV-003_CreateReview_InvalidRating_ReturnsBadRequest` and `API-REV-010_UpdateReview_InvalidInformation_ReturnsBadRequest` now receive `400 Bad Request` with descriptive error messages.
- **Final Status:** CLOSED (PASS)

---

### DEF-REV-002: Missing Authorization Check on Review Update and Deletion
- **Defect ID:** DEF-REV-002
- **Associated Test Cases:** API-REV-011, API-REV-013, WEB-REV-007
- **Severity:** Critical
- **Layer:** Backend API / Security (`ReviewsController.cs`)
- **Description:** Any authenticated traveler could update or delete any other user's review by passing an arbitrary `{id}` to `PUT /api/v1/reviews/{id}` or `DELETE /api/v1/reviews/{id}`, representing a serious Insecure Direct Object Reference (IDOR) vulnerability.
- **Root Cause:** Handlers retrieved the review from the repository and performed mutations without comparing `review.UserId` to the authenticated user's claim ID (`GetUserId()`).
- **Fix Applied:** Implemented ownership validation:
  ```csharp
  if (review.UserId != userId)
  {
      return StatusCode(403, "You can only update/delete your own reviews.");
  }
  ```
  in `ReviewsController.cs`.
- **Retest Result:** Retested in `API-REV-011_UpdateReview_AnotherUsersReview_ReturnsForbidden` and `API-REV-013_DeleteReview_AnotherUsersReview_ReturnsForbidden`. Requests by non-owners now return `403 Forbidden`.
- **Final Status:** CLOSED (PASS)

---

### DEF-REV-003: "My Reviews" Fallback Leaking Other Users' Reviews
- **Defect ID:** DEF-REV-003
- **Associated Test Cases:** API-REV-007, API-REV-008, WEB-REV-009, MOB-REV-007
- **Severity:** Medium
- **Layer:** Backend API (`ReviewsController.cs`)
- **Description:** Calling `GET /api/v1/reviews/my-reviews` as an authenticated user who has never posted a review returned demo/mock reviews written by other users, confusing user state and violating data isolation.
- **Root Cause:** A fallback block in `GetMyReviews` defaulted to returning a list of system demo reviews when `userReviews.Count == 0`.
- **Fix Applied:** Removed fallback leaking demo reviews; `GetMyReviews` now returns `Ok(new List<ReviewResponse>())` when the authenticated user has no reviews, while still populating user-specific items if they exist.
- **Retest Result:** Retested in `API-REV-008_GetMyReviews_UserHasNoReviews_ReturnsEmptyList`. Returns HTTP 200 OK with empty array `[]`.
- **Final Status:** CLOSED (PASS)

---

### DEF-REC-001: Missing Null Check and MinRating Boundary Validation on Smart-Match
- **Defect ID:** DEF-REC-001
- **Associated Test Cases:** API-REC-002, API-REC-003, WEB-REC-003, WEB-REC-004
- **Severity:** Medium
- **Layer:** Backend API (`RecommendationsController.cs`)
- **Description:** `POST /api/v1/recommendations/smart-match` allowed passing invalid rating filter criteria (such as negative ratings or ratings > 5.0) and threw `NullReferenceException` when request payloads were omitted.
- **Root Cause:** The action method lacked a null request check and bounds validation on `request.MinRating`.
- **Fix Applied:** Added guard check:
  ```csharp
  if (request == null)
  {
      return BadRequest("Request body is required.");
  }
  if (request.MinRating < 0 || request.MinRating > 5)
  {
      return BadRequest("MinRating must be between 0 and 5.");
  }
  ```
  in `RecommendationsController.cs`.
- **Retest Result:** Retested in `API-REC-002_SmartMatch_MissingRequiredInput_ReturnsHandledResponse` and `API-REC-003_SmartMatch_InvalidInputValues_ReturnsBadRequest`. Both cases reject invalid input with `400 Bad Request`.
- **Final Status:** CLOSED (PASS)
