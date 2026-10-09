# Tour & Guide Management — Defects Log

This document records the genuine defects discovered in the NOVA Tour & Guide Management codebase during automated test implementation and execution, along with their root causes, fixes applied, and retest verification results.

---

## Defects Summary Matrix

| Defect ID | Test Case ID | Severity | Component | Description | Status |
|---|---|---|---|---|---|
| **DEF-GUI-001** | API-GUI-002, API-GUI-003, API-GUI-009 | High | Backend / DTOs | Missing validation data annotations on `CreateGuideRequest` & `UpdateGuideRequest` | **CLOSED (Verified)** |
| **DEF-AVL-001** | API-AVL-008 | Medium | Backend / API | `GuideAvailabilityController.GetByGuide` returned 200 OK `[]` for non-existing guides instead of 404 | **CLOSED (Verified)** |
| **DEF-AVL-002** | API-AVL-004 | High | Backend / API | `GuideAvailabilityController.Create` accepted inverted time ranges (`EndTime <= StartTime`) | **CLOSED (Verified)** |
| **DEF-TPK-001** | API-TPK-002, API-TPK-003, API-TPK-009 | High | Backend / DTOs | Missing validation annotations on `CreateTourPackageRequest` and `UpdateTourPackageRequest` | **CLOSED (Verified)** |
| **DEF-TOP-001** | API-TOP-002, API-TOP-003, API-TOP-008 | High | Backend / API & DTOs | Missing validation for `ScheduledDate`, zero tourists, and negative total cost in Tour Operations | **CLOSED (Verified)** |

---

## Detailed Defect Records

### DEF-GUI-001: Missing Validation Annotations on Guide Requests
- **Defect ID:** DEF-GUI-001
- **Associated Test Cases:** API-GUI-002, API-GUI-003, API-GUI-009, WEB-GUI-005
- **Severity:** High
- **Layer:** Backend API / DTOs
- **Description:** `CreateGuideRequest` and `UpdateGuideRequest` in `GuideDtos.cs` lacked data validation attributes (`[Required]`, `[EmailAddress]`, `[Range]`). Consequently, POST `/api/v1/guides` and PUT `/api/v1/guides/{id}` accepted empty names, malformed email addresses, and invalid years of experience without returning 400 Bad Request.
- **Root Cause:** DTO record parameters were declared as raw strings and numbers without standard ASP.NET Core `System.ComponentModel.DataAnnotations` attributes.
- **Fix Applied:** Added `[Required]`, `[EmailAddress]`, and `[Range(0, 70)]` attributes to `CreateGuideRequest` and `UpdateGuideRequest` in `backend/Nova.Api/DTOs/Guides/GuideDtos.cs`.
- **Retest Result:** API-GUI-002, API-GUI-003, and API-GUI-009 execute against `NovaApiHost`, returning `400 Bad Request` with `ValidationProblemDetails`.
- **Final Status:** CLOSED (PASS)

---

### DEF-AVL-001: Missing 404 Check for Non-Existing Guides in Availability Lookup
- **Defect ID:** DEF-AVL-001
- **Associated Test Cases:** API-AVL-008
- **Severity:** Medium
- **Layer:** Backend API / Controller
- **Description:** Calling `GET /api/v1/guides/{guideId}/availability` with an invalid/non-existing `guideId` returned `200 OK` with an empty array `[]` rather than `404 Not Found`.
- **Root Cause:** `GuideAvailabilityController.GetByGuide` queried `_db.GuideAvailabilities.Where(ga => ga.GuideId == guideId)` directly without checking whether the parent Guide record actually existed in `_db.Guides`.
- **Fix Applied:** Added `var guide = await _db.Guides.FindAsync(guideId); if (guide is null) return NotFound("Guide not found.");` prior to querying availabilities in `backend/Nova.Api/Controllers/GuidesController.cs`.
- **Retest Result:** Retested against `NovaApiHost`. Requesting availability for non-existing guide ID 999999 returns `404 Not Found`.
- **Final Status:** CLOSED (PASS)

---

### DEF-AVL-002: Inverted Time Ranges Accepted for Guide Availability
- **Defect ID:** DEF-AVL-002
- **Associated Test Cases:** API-AVL-004, WEB-AVL-004
- **Severity:** High
- **Layer:** Backend API / Controller
- **Description:** `POST /api/v1/guides/{guideId}/availability` accepted payloads where `EndTime` preceded or equaled `StartTime` (e.g. Start: 17:00, End: 09:00), corrupting slot chronology.
- **Root Cause:** Lack of time boundary validation in `GuideAvailabilityController.Create`.
- **Fix Applied:** Added temporal validation check `if (request.EndTime <= request.StartTime) return BadRequest("EndTime must be after StartTime.");` and `if (request.AvailableDate == default) return BadRequest("Valid AvailableDate is required.");` in `backend/Nova.Api/Controllers/GuidesController.cs`.
- **Retest Result:** API-AVL-004 retested; inverted time interval requests are rejected with `400 Bad Request`.
- **Final Status:** CLOSED (PASS)

---

### DEF-TPK-001: Missing Validation on Tour Package DTOs
- **Defect ID:** DEF-TPK-001
- **Associated Test Cases:** API-TPK-002, API-TPK-003, API-TPK-009, WEB-TPK-005
- **Severity:** High
- **Layer:** Backend API / DTOs
- **Description:** `CreateTourPackageRequest` and `UpdateTourPackageRequest` did not validate essential domain parameters, allowing packages with negative prices, 0 duration days, 0 group capacity, and empty package names.
- **Root Cause:** DTO records omitted DataAnnotations constraints.
- **Fix Applied:** Added `[Required]` for `PackageName` and `Destination`, `[Range(0.01, 1000000.0)]` for `Price`, `[Range(1, 365)]` for `DurationDays`, and `[Range(1, 1000)]` for `MaxGroupSize` in `backend/Nova.Api/DTOs/Guides/GuideDtos.cs`.
- **Retest Result:** API-TPK-002, API-TPK-003, and API-TPK-009 retested against `NovaApiHost`; invalid values return `400 Bad Request`.
- **Final Status:** CLOSED (PASS)

---

### DEF-TOP-001: Missing Validation on Tour Operation Requests
- **Defect ID:** DEF-TOP-001
- **Associated Test Cases:** API-TOP-002, API-TOP-003, API-TOP-008, WEB-TOP-002
- **Severity:** High
- **Layer:** Backend API / DTOs & Controller
- **Description:** `CreateTourOperationRequest` and `UpdateTourOperationRequest` permitted zero or negative tourists, negative total costs, and default/empty dates.
- **Root Cause:** No range constraints on DTO parameters and no check for `request.ScheduledDate == default` in controller.
- **Fix Applied:** Added `[Range(1, 1000)]` for `NumberOfTourists`, `[Range(0.0, 10000000.0)]` for `TotalCost`, `[Required]` on `ScheduledDate` in `GuideDtos.cs`, and explicit `if (request.ScheduledDate == default) return BadRequest("ScheduledDate cannot be empty.");` in `TourPackageAndOperationsController.cs`.
- **Retest Result:** API-TOP-002, API-TOP-003, and API-TOP-008 retested; rejected with `400 Bad Request`.
- **Final Status:** CLOSED (PASS)
