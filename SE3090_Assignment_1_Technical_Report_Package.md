# SE3090 Assignment 1: Consolidated Technical Information Package
**Project Name:** TravelLink (NOVA) – Smart Tourism Planner  
**Course:** SE3090 - Software Architecture and Design  
**Date of Extraction:** September 2026  
**Repository:** `https://github.com/hirunipraboda/tourism-management-app.git`  
**Active Working Branch:** `admin-panel` (Merged base: `Trip-and-Itinerary-Management`)

---

# PART 1 — PROJECT OVERVIEW

### 1. Project Name
* **Project Name:** TravelLink (Internal System Identifier: **NOVA** – Smart Tourism Planner)
* **Codebase Namespaces:** `Nova.Api`, `Nova.Tests`
* **Evidence:** [Nova.Api.csproj](file:///c:/Users/user/NOVA/backend/Nova.Api/Nova.Api.csproj#L1-L15), [package.json](file:///c:/Users/user/NOVA/frontend/package.json#L1-L5), [pubspec.yaml](file:///c:/Users/user/NOVA/mobile/pubspec.yaml#L1-L5).

### 2. Business Problem
Tourists planning trips to Sri Lanka encounter fragmented information across disconnected platforms for attraction discovery, transport schedules, activity reservations, safety guidelines, and tour operator verification. Travelers struggle to assemble realistic, conflict-free daily itineraries that balance travel time, budget constraints, physical constraints, and safety guidelines. Tourism operators and administrative authorities lack a unified digital management dashboard to monitor bookings, verify listings, audit AI-generated itineraries, manage public transit routes, and moderate tourist reviews.

### 3. Proposed Solution
A multi-tier smart tourism ecosystem comprising:
1. An **Agentic AI Trip Planning Engine** that autonomously decomposes user travel criteria, queries verified destination and attraction repositories, arranges conflict-free activity schedules, checks public transit logistics, applies safety validation, and produces structured multi-day itineraries.
2. A **Human-in-the-Loop (HITL) Approval Mechanism** where tourists and registered tourism operators review, approve, reject, or request revisions on AI-generated travel plans before finalization.
3. An **Enterprise Web Portal (React 19)** catering to both tourists/operators and platform administrators (comprehensive 12-suite administrative console).
4. A **Cross-Platform Mobile Application (Flutter)** providing tourists with mobile itinerary exploration and AI planning access.
5. A high-performance **ASP.NET Core 8 Web API** backed by **PostgreSQL** that acts as the single source of truth and enforces role-based access control (RBAC).

### 4. Target Users
* **Tourists (Independent Travelers):** Create trips, trigger AI itinerary generation, customize itinerary items, search transit schedules, view tour packages, and submit reviews.
* **Tourism Operators (Local Guides & Agencies):** Inspect itineraries assigned to their operational regions, perform safety reviews, approve/reject plans, and provide guided tour packages.
* **System Administrators:** Oversee platform users, verify destinations/attractions, manage public bus/train schedules, monitor AI workflow traces, inspect payments, and oversee system health.

### 5. Main Objectives
* Automate intelligent itinerary synthesis using specialized AI agents with deterministic validation.
* Eliminate scheduling overlaps and budget overruns using automated constraint checks.
* Provide multi-modal transport routing combining Sri Lanka Railways schedules, intercity buses, and third-party transit APIs.
* Enforce human governance over automated AI recommendations through approval state transitions (`PendingApproval` $\to$ `Approved` / `RevisionRequested` / `Rejected`).
* Deliver centralized administrative governance across all tourism sub-domains.

### 6. Current System Scope
* **In Scope & Implemented:** 
  * User authentication with JWT and RBAC (`Tourist`, `TourismOperator`, `Admin`).
  * Manual and AI-driven Trip and Itinerary planning.
  * Multi-agent generation workflow with atomic audit logging.
  * Human-in-the-loop approval workflow.
  * Public transit search and selection (Sri Lanka Railways and CTB/intercity bus registry with Google Maps Directions API fallback).
  * Comprehensive Admin Console (Users, Destinations, Attractions, Activities, Transit, AI Workflows, Bookings, Payments, Reviews).
* **Partially Implemented:**
  * Real payment gateway execution (mocked via database transaction records).
  * Flutter mobile authentication and device hardware sensor integration.
* **Out of Scope / Planned:**
  * Native GPS background tracking.
  * Push notification daemon.
  * Production Kubernetes / Cloud deployment manifests.

### 7. Implemented Features
* Tourist & Operator Registration / Login with JWT authentication ([AuthController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/AuthController.cs)).
* Trip Creation and Lifecycle Management ([TripsController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/TripsController.cs)).
* Agentic AI Itinerary Generation Engine ([ItineraryGenerationController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/ItineraryGenerationController.cs)).
* 4-Agent Autonomous Pipeline: `TravelPlanningAgent`, `DestinationResearchAgent`, `TravelLogisticsAgent`, `SafetyValidationAgent` ([TourismAgents.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/Agents/TourismAgents.cs)).
* Deterministic Itinerary Validation Service ([ItineraryValidationService.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/ItineraryValidationService.cs)).
* Human Approval State Workflow ([ApprovalService.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/ApprovalService.cs)).
* Multi-Modal Transit Search & Google Transit Fallback ([TransportService.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/TransportService.cs)).
* Admin Control Suites (12 full management views across React & ASP.NET Core) ([AdminController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/AdminController.cs), [AdminTransportationController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/AdminTransportationController.cs)).

### 8. Partially Implemented Features
* **Payment Processing:** Payment models and admin reporting exist for Chatbot and Promo purchases (`ChatbotPayment`, `PromoPayment`), but transactions are simulated without Stripe/PayHere webhook processing.
* **Flutter Mobile Integration:** Flutter app renders Home, AI Planner, and Bookings views via API calls to ASP.NET Core, but lacks JWT token persistence and login screens.
* **Google Maps Directions API:** Implemented with API key parameter and offline transit fallback, but requires a live billing-enabled key in production.

### 9. Planned / Unimplemented Features
* Hardware device sensors (GPS geofencing, Camera QR scanning, Push notifications).
* Production containerization / Helm charts (Dockerfiles and Kubernetes manifests are not present in repository).
* Redis distributed cache (currently using EF Core query pipeline).

### 10. Main Technologies and Frameworks
| Layer | Technology | Version | Purpose | Evidence |
|---|---|---|---|---|
| **Backend API** | ASP.NET Core Web API | .NET 8.0 | Core REST API, business logic, agent orchestration | [Nova.Api.csproj](file:///c:/Users/user/NOVA/backend/Nova.Api/Nova.Api.csproj#L5-L10) |
| **ORM / Data Access** | Entity Framework Core / Npgsql | 8.0.2 / 8.0.2 | Object-relational mapping, PostgreSQL migrations | [Nova.Api.csproj](file:///c:/Users/user/NOVA/backend/Nova.Api/Nova.Api.csproj#L12-L16) |
| **Database** | PostgreSQL | 16 / Latest | Relational persistence, JSONB data, relational constraints | [appsettings.json](file:///c:/Users/user/NOVA/backend/Nova.Api/appsettings.json#L2-L4) |
| **Web Frontend** | React | 19.2.8 | Responsive Single Page Application (SPA) & Admin Portal | [frontend/package.json](file:///c:/Users/user/NOVA/frontend/package.json#L12-L17) |
| **Build Tooling** | Vite | 8.2.1 | Fast HMR frontend bundling and development server | [frontend/package.json](file:///c:/Users/user/NOVA/frontend/package.json#L28-L30) |
| **Styling** | Tailwind CSS | 4.3.3 | Utility-first CSS styling and modern glassmorphic UI | [frontend/package.json](file:///c:/Users/user/NOVA/frontend/package.json#L31) |
| **Icons** | Lucide React | 1.16.0 | Modern SVG iconography | [frontend/package.json](file:///c:/Users/user/NOVA/frontend/package.json#L15) |
| **Mobile App** | Flutter | SDK >=3.0.0 <4.0.0 | Cross-platform mobile client for Android/iOS | [mobile/pubspec.yaml](file:///c:/Users/user/NOVA/mobile/pubspec.yaml#L7-L12) |
| **AI Orchestration (C#)** | Task Parallel Library / Semantic Agents | Native .NET 8 | Deterministic multi-agent execution pipeline | [TourismAgents.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/Agents/TourismAgents.cs) |
| **AI Prototype (Python)** | LangChain / LangGraph / Google Gemini | Python 3.10+ | Prototype multi-agent RAG exploration | [ai-agents/pyproject.toml](file:///c:/Users/user/NOVA/ai-agents/pyproject.toml#L1-L25) |
| **Unit Testing** | xUnit + Moq + FluentAssertions | 2.5.3 / 4.18.4 | Comprehensive backend unit and service testing | [Nova.Tests.csproj](file:///c:/Users/user/NOVA/backend/Nova.Tests/Nova.Tests.csproj#L10-L16) |
| **CI/CD** | GitHub Actions | YAML v2 | Automated multi-project build and verification pipeline | [.github/workflows/ci.yml](file:///c:/Users/user/NOVA/.github/workflows/ci.yml#L1-L50) |

---

# PART 2 — USER ROLES

The system implements three distinct roles managed via ASP.NET Core Identity/JWT claims:

```
[System Roles]
 ├── Tourist
 ├── TourismOperator
 └── Admin
```

### Role Matrix Table

| Role Name | Permissions | Frontend Access | API Access | Database Permissions | Authentication Mechanism | Code Definition |
|---|---|---|---|---|---|---|
| **Tourist** | Create/edit trips, generate AI itineraries, manage personal itinerary items, search transit, submit reviews, approve/reject personal itineraries | `/trips`, `/planner`, `/ai-planner`, `/manual-planner`, `/tours`, `/profile`, `/reviews-recommendations` | `POST /api/trips`, `POST /api/itinerary-generation/plan`, `PUT /api/itineraries/{id}/approve`, `POST /api/transport/search/transit` | Full CRUD on owned `trips`, `itineraries`, `itinerary_items`, Read-only on `destinations`, `activities`, `bus_routes`, `train_schedules` | JWT Bearer token with claim `ClaimTypes.Role = "Tourist"` | [User.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/User.cs#L14), [AuthController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/AuthController.cs#L45) |
| **TourismOperator** | View assigned/regional itineraries, evaluate safety and feasibility, approve or request revisions with notes, list tour packages | `/tours`, `/trips` (operator review view), `/profile` | `GET /api/trips`, `GET /api/itineraries/{id}`, `PUT /api/itineraries/{id}/approve`, `PUT /api/itineraries/{id}/request-revision` | Read on all trips/itineraries; Insert into `itinerary_approvals` and `workflow_audit_logs` | JWT Bearer token with claim `ClaimTypes.Role = "TourismOperator"` | [User.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/User.cs#L14), [ApprovalService.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/ApprovalService.cs#L40) |
| **Admin** | Full administrative governance over platform users, destinations, attractions, activities, transit schedules, AI workflows, bookings, payments, and system health | `/admin`, `/admin/users`, `/admin/destinations`, `/admin/attractions`, `/admin/activities`, `/admin/transportation`, `/admin/ai-workflows`, `/admin/bookings`, `/admin/chatbot-payments`, `/admin/promo-payments`, `/admin/reviews` | `GET/POST/PUT/DELETE /api/admin/*`, `GET/POST/PUT/DELETE /api/admin/transportation/*` | Full CRUD across all 24 database tables | JWT Bearer token with claim `ClaimTypes.Role = "Admin"`; Enforced via `[Authorize(Roles = "Admin")]` | [AdminController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/AdminController.cs#L12), [AdminTransportationController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/AdminTransportationController.cs#L11) |

---

# PART 3 — FUNCTIONAL REQUIREMENTS

| Req ID | Feature Name | Description | User/Actor | Frontend Implementation | Backend Implementation | Database Entities | API Endpoints | Status | Evidence / File Path |
|---|---|---|---|---|---|---|---|---|---|
| **FR-01** | User Registration & Login | Secure registration and login issuing JWT tokens with designated roles | Tourist, Operator, Admin | [LoginPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/LoginPage.tsx), [AdminLoginPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/admin/AdminLoginPage.tsx) | [AuthController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/AuthController.cs) | `users` | `POST /api/auth/register`, `POST /api/auth/login` | **Implemented** | [AuthController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/AuthController.cs#L20-L80) |
| **FR-02** | Manual Trip Creation | Allows users to create a trip profile specifying destination, date range, budget, travel style, and group size | Tourist | [ManualTripPlannerPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/ManualTripPlannerPage.tsx) | [TripsController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/TripsController.cs), [TripService.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/TripService.cs) | `trips` | `POST /api/trips`, `GET /api/trips`, `GET /api/trips/{id}` | **Implemented** | [TripsController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/TripsController.cs#L20-L65) |
| **FR-03** | Autonomous AI Itinerary Generation | Triggers multi-agent pipeline to generate structured daily itineraries with conflict-free scheduling and safety scores | Tourist | [AITripPlannerPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/AITripPlannerPage.tsx) | [ItineraryGenerationController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/ItineraryGenerationController.cs), [ItineraryGenerationService.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/ItineraryGenerationService.cs) | `itineraries`, `itinerary_days`, `itinerary_items`, `itinerary_generation_workflows`, `workflow_audit_logs` | `POST /api/itinerary-generation/plan` | **Implemented** | [ItineraryGenerationController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/ItineraryGenerationController.cs#L22-L45) |
| **FR-04** | Deterministic Itinerary Validation | Automatically validates budget constraints, chronological time sequences, activity overlap, and travel feasibility | System / Agent | Executed server-side | [ItineraryValidationService.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/ItineraryValidationService.cs) | In-memory evaluation of `itinerary_items` & `trips` | Internal service call during generation | **Implemented** | [ItineraryValidationService.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/ItineraryValidationService.cs#L14-L85) |
| **FR-05** | Human Approval Workflow | Enables tourists and operators to review, approve, reject, or request revisions on generated itineraries | Tourist, Operator | [TripsPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/TripsPage.tsx), [AITripPlannerPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/AITripPlannerPage.tsx) | [ItinerariesController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/ItinerariesController.cs), [ApprovalService.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/ApprovalService.cs) | `itineraries`, `itinerary_approvals`, `workflow_audit_logs` | `PUT /api/itineraries/{id}/approve`, `PUT /api/itineraries/{id}/reject`, `PUT /api/itineraries/{id}/request-revision` | **Implemented** | [ApprovalService.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/ApprovalService.cs#L20-L100) |
| **FR-06** | Multi-Modal Transit Search | Queries Sri Lanka train schedules and bus routes; falls back to Google Maps Transit API | Tourist | Integrated in itinerary view & manual planner | [TransportController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/TransportController.cs), [TransportService.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/TransportService.cs) | `bus_routes`, `train_schedules`, `transport_options` | `POST /api/transport/search/transit`, `POST /api/transport/select`, `DELETE /api/transport/{id}` | **Implemented** | [TransportController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/TransportController.cs#L19-L55) |
| **FR-07** | Destination & Attraction Discovery | Search and filter verified destinations and curated cultural attractions | Tourist, Admin | [AdminDestinationsPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/admin/AdminDestinationsPage.tsx), [LandingPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/LandingPage.tsx) | [DestinationsController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/DestinationsController.cs), [AdminController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/AdminController.cs) | `destinations`, `attractions` | `GET /api/destinations`, `GET /api/destinations/{id}` | **Implemented** | [DestinationsController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/DestinationsController.cs#L15-L40) |
| **FR-08** | Admin User Management | List, search, role modify, and deactivate users | Admin | [AdminUsersPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/admin/AdminUsersPage.tsx) | [AdminController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/AdminController.cs) | `users` | `GET /api/admin/users`, `POST /api/admin/users`, `PUT /api/admin/users/{id}`, `DELETE /api/admin/users/{id}` | **Implemented** | [AdminController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/AdminController.cs#L75-L135) |
| **FR-09** | Admin Public Transit Management | Management of bus routes, stops, train schedules, seat availability, and transit metrics | Admin | [AdminTransportationPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/admin/AdminTransportationPage.tsx) | [AdminTransportationController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/AdminTransportationController.cs) | `bus_routes`, `train_schedules` | `GET/POST/PUT/DELETE /api/admin/transportation/bus-routes`, `GET/POST/PUT/DELETE /api/admin/transportation/train-schedules` | **Implemented** | [AdminTransportationController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/AdminTransportationController.cs#L22-L135) |
| **FR-10** | Admin AI Workflow Monitoring | Live inspection of AI generation workflows, step-by-step agent execution audit logs, and retry handling | Admin | [AdminAIWorkflowsPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/admin/AdminAIWorkflowsPage.tsx) | [AdminController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/AdminController.cs) | `itinerary_generation_workflows`, `workflow_audit_logs` | `GET /api/admin/ai/workflows`, `GET /api/admin/ai/workflows/{id}/logs`, `POST /api/admin/ai/workflows/{id}/retry` | **Implemented** | [AdminController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/AdminController.cs#L365-L425) |
| **FR-11** | Mobile Itinerary & AI Planning | Mobile exploration of trips and triggering of AI itinerary generator | Tourist | [home_screen.dart](file:///c:/Users/user/NOVA/mobile/lib/screens/home_screen.dart), [ai_planner_screen.dart](file:///c:/Users/user/NOVA/mobile/lib/screens/ai_planner_screen.dart) | [api_service.dart](file:///c:/Users/user/NOVA/mobile/lib/services/api_service.dart) calling ASP.NET Core API | `trips`, `itineraries` | `POST /api/itinerary-generation/plan`, `GET /api/trips` | **Partially Implemented** | [ai_planner_screen.dart](file:///c:/Users/user/NOVA/mobile/lib/screens/ai_planner_screen.dart#L25-L95) |
| **FR-12** | Payment Processing | Payment tracking and record management for Chatbot packages and Promo usages | Tourist, Admin | [AdminChatbotPaymentsPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/admin/AdminChatbotPaymentsPage.tsx), [AdminPromoPaymentsPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/admin/AdminPromoPaymentsPage.tsx) | [AdminController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/AdminController.cs) | `chatbot_payments`, `promo_payments` | `GET /api/admin/chatbot-payments`, `GET /api/admin/promo-payments` | **Partially Implemented** | Simulated in DB |

---

# PART 4 — NON-FUNCTIONAL REQUIREMENTS

### 1. Security
* **Implementation:** Standard JWT Bearer token authentication with HMAC-SHA256 signature verification. Role-based authorization policies enforce separation across `Tourist`, `TourismOperator`, and `Admin`. Password hashing is implemented using PBKDF2/cryptographic salt hashing.
* **Evidence:** [Program.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Program.cs#L35-L60), [AuthController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/AuthController.cs#L85-L115), [User.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/User.cs).

### 2. Performance
* **Implementation:** Asynchronous non-blocking I/O across all API endpoints using `async/await`. Entity Framework Core query optimization with index configurations on `destinations(name)`, `bus_routes(origin, destination)`, and `train_schedules(departure_station, arrival_station)`. In-memory static transit caching fallback when external Google Maps API requests exceed timeout thresholds.
* **Evidence:** [NovaDbContext.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Data/NovaDbContext.cs#L75-L95), [TransportService.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/TransportService.cs#L60-L90).

### 3. Scalability
* **Implementation:** Stateless ASP.NET Core Web API architecture capable of horizontal scaling behind a reverse proxy (Nginx/AWS ALB). Persistent workflow state stored in PostgreSQL allows any backend instance to resume workflow retries.
* **Evidence:** [ItineraryGenerationService.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/ItineraryGenerationService.cs#L30-L55).

### 4. Reliability
* **Implementation:** Resilient fallback pattern in transit services: if the Google Maps Directions API times out or fails (e.g., HTTP 4xx/5xx or rate limit), the system automatically executes a fallback lookup in the internal `train_schedules` and `bus_routes` tables. Database migrations run idempotently on startup.
* **Evidence:** [TransportService.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/TransportService.cs#L95-L125), [Program.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Program.cs#L100-L115).

### 5. Usability
* **Implementation:** React 19 responsive interface with Tailwind CSS dark/glassmorphic theme. Real-time feedback badges, interactive workflow timelines, and clear error banners. Flutter mobile interface utilizes Material Design 3 and Google Fonts.
* **Evidence:** [AdminAIWorkflowsPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/admin/AdminAIWorkflowsPage.tsx#L40-L110), [main.dart](file:///c:/Users/user/NOVA/mobile/lib/main.dart#L15-L35).

### 6. Maintainability
* **Implementation:** Clean Layered Architecture separating Controllers $\to$ Services $\to$ Data Context $\to$ Database Entities. Single-responsibility services (`TripService`, `ApprovalService`, `ItineraryValidationService`, `TransportService`). Unit test project (`Nova.Tests`) with 41 xUnit tests verifying business logic.
* **Evidence:** [Nova.Api/Services](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/), [Nova.Tests](file:///c:/Users/user/NOVA/backend/Nova.Tests/).

### 7. Availability
* **Implementation:** Database connection resilience with Npgsql retry policies configured in EF Core. Health monitoring endpoint `/health` returning HTTP 200 and database ping status.
* **Evidence:** [AdminController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/AdminController.cs#L450-L465).

### 8. Accessibility
* **Implementation:** Semantic HTML5 structure throughout React pages with ARIA roles, labeled inputs, high-contrast color palettes, and keyboard-navigable dialogs.
* **Evidence:** [LoginPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/LoginPage.tsx), [AdminUsersPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/admin/AdminUsersPage.tsx).

### 9. Validation
* **Implementation:** Strict input validation at API boundary using Data Annotations (`[Required]`, `[Range]`, `[EmailAddress]`). Domain validation in `ItineraryValidationService` enforcing business rules: budget $> 0$, dates valid, zero time conflicts, transit travel limits.
* **Evidence:** [TripDto.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/DTOs/TripDto.cs), [ItineraryValidationService.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/ItineraryValidationService.cs).

### 10. Error Handling
* **Implementation:** Global exception-safe controller responses returning standardized `ApiResponse<T>` or `ProblemDetails`. Validation errors return structured HTTP 400 Bad Request with explicit field messages.
* **Evidence:** [AuthController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/AuthController.cs#L35-L42), [TripsController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/TripsController.cs#L40-L48).

---

# PART 5 — COMPLETE SYSTEM ARCHITECTURE

### Architecture Communication Model
```
[Client Tier]
  ├── React 19 Web App (Vite SPA) ──────┐ (HTTP/JSON + JWT)
  └── Flutter Mobile Client ─────────────┼────────┐
                                         │        │
[API Gateway & Application Tier]         ▼        ▼
  ASP.NET Core 8 Web API (Nova.Api :5000)
    ├── Authentication & RBAC Middleware
    ├── Controllers (Admin, Auth, Trips, Itineraries, Transport, etc.)
    ├── Business Service Layer (TripService, ApprovalService, TransportService)
    ├── Autonomous Agentic AI Engine (4 C# Tourism Agents + Orchestrator)
    │     ├── TravelPlanningAgent
    │     ├── DestinationResearchAgent
    │     ├── TravelLogisticsAgent
    │     └── SafetyValidationAgent
    └── Deterministic Validator (ItineraryValidationService)
          │
[Persistence & External Integration]
    ├── PostgreSQL Database (:5432) (24 Relational Tables via EF Core)
    ├── Google Maps Directions / Transit API (External HTTP REST)
    └── (Standalone Python Suite: LangGraph / Gemini 1.5 RAG Prototype)
```

### Critical Architecture Findings:
1. **Client Communication:** Both the React web application and the Flutter mobile application communicate **strictly through the ASP.NET Core Web API**. Neither client talks directly to PostgreSQL or external services.
2. **AI Service Invocation:** The production Agentic AI generation pipeline runs **inside the ASP.NET Core backend** as an asynchronous orchestrator service (`ItineraryGenerationService`). Clients trigger generation via `POST /api/itinerary-generation/plan`, and the backend delegates work across the 4 specialized agents.
3. **Python AI Suite Role:** The Python codebase in `ai-agents/` acts as an exploratory RAG prototype leveraging LangChain, FAISS, and Gemini 1.5. In production runtime, the system relies on the integrated C# multi-agent engine in `Nova.Api`.

---

# PART 6 — DATABASE ANALYSIS

### Database Engine & Configuration
* **Database:** PostgreSQL (16)
* **ORM:** Entity Framework Core 8.0.2 with `Npgsql.EntityFrameworkCore.PostgreSQL`
* **DbContext:** `NovaDbContext` ([NovaDbContext.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Data/NovaDbContext.cs))
* **Naming Convention:** Snake-case database table and column mapping via EF Core metadata conventions.

### Complete Entity & Table Registry (24 Tables)

| # | Entity / Table Name | Primary Key | Foreign Keys | Key Attributes & Data Types | Relationships | Evidence File |
|---|---|---|---|---|---|---|
| 1 | `users` | `id` (int) | None | `name` (varchar), `email` (varchar, unique), `password_hash` (text), `role` (varchar), `created_at` (timestamptz) | 1:M with `trips`, `itinerary_approvals`, `reviews`, `bookings` | [User.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/User.cs) |
| 2 | `destinations` | `id` (int) | None | `name` (varchar), `description` (text), `location` (varchar), `category` (varchar), `image_url` (text), `is_active` (bool) | 1:M with `activities`, `attractions` | [Destination.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/Destination.cs) |
| 3 | `attractions` | `id` (int) | `destination_id` $\to$ `destinations(id)` | `name` (varchar), `description` (text), `ticket_price` (decimal), `opening_hours` (varchar), `latitude`, `longitude` (double) | M:1 with `destinations` | [AdminEntities.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/AdminEntities.cs#L85-L105) |
| 4 | `activities` | `id` (int) | `destination_id` $\to$ `destinations(id)` | `name` (varchar), `description` (text), `cost` (decimal), `duration_minutes` (int), `category` (varchar) | M:1 with `destinations`, 1:M with `itinerary_items` | [Activity.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/Activity.cs) |
| 5 | `trips` | `id` (int) | `user_id` $\to$ `users(id)` | `title` (varchar), `destination` (varchar), `start_date`, `end_date` (date), `budget` (decimal), `travel_style` (varchar), `travelers` (int), `status` (varchar) | M:1 with `users`, 1:M with `itineraries`, 1:M with `itinerary_generation_workflows` | [TripEntities.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/TripEntities.cs#L5-L25) |
| 6 | `itineraries` | `id` (int) | `trip_id` $\to$ `trips(id)` | `title` (varchar), `total_cost` (decimal), `is_ai_generated` (bool), `status` (varchar: Draft/PendingApproval/Approved/Rejected), `created_at` | M:1 with `trips`, 1:M with `itinerary_days`, 1:M with `itinerary_approvals` | [TripEntities.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/TripEntities.cs#L30-L50) |
| 7 | `itinerary_days` | `id` (int) | `itinerary_id` $\to$ `itineraries(id)` | `day_number` (int), `date` (date), `title` (varchar), `notes` (text) | M:1 with `itineraries`, 1:M with `itinerary_items` | [TripEntities.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/TripEntities.cs#L55-L70) |
| 8 | `itinerary_items` | `id` (int) | `itinerary_day_id` $\to$ `itinerary_days(id)`, `activity_id` $\to$ `activities(id)` | `start_time`, `end_time` (varchar), `activity_name` (varchar), `cost` (decimal), `location` (varchar), `transport_type` (varchar) | M:1 with `itinerary_days`, M:1 with `activities` | [TripEntities.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/TripEntities.cs#L75-L95) |
| 9 | `itinerary_generation_workflows` | `id` (int) | `trip_id` $\to$ `trips(id)` | `workflow_id` (uuid), `current_state` (varchar), `progress_percentage` (int), `retry_count` (int), `created_at`, `updated_at` | M:1 with `trips`, 1:M with `workflow_audit_logs` | [TripEntities.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/TripEntities.cs#L100-L120) |
| 10 | `workflow_audit_logs` | `id` (int) | `workflow_id` $\to$ `itinerary_generation_workflows(id)` | `agent_name` (varchar), `action_taken` (varchar), `execution_status` (varchar), `output_payload` (jsonb/text), `logged_at` | M:1 with `itinerary_generation_workflows` | [TripEntities.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/TripEntities.cs#L125-L140) |
| 11 | `itinerary_approvals` | `id` (int) | `itinerary_id` $\to$ `itineraries(id)`, `reviewed_by_user_id` $\to$ `users(id)` | `decision` (varchar), `comments` (text), `reviewed_at` (timestamptz) | M:1 with `itineraries`, M:1 with `users` | [TripEntities.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/TripEntities.cs#L145-L160) |
| 12 | `bus_routes` | `id` (int) | None | `route_number` (varchar), `origin` (varchar), `destination` (varchar), `fare` (decimal), `frequency_minutes` (int), `stops` (jsonb/text) | Indexed on `(origin, destination)` | [AdminEntities.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/AdminEntities.cs#L5-L25) |
| 13 | `train_schedules` | `id` (int) | None | `train_number` (varchar), `train_name` (varchar), `departure_station` (varchar), `arrival_station` (varchar), `departure_time`, `arrival_time`, `seat_classes` (varchar) | Indexed on `(departure_station, arrival_station)` | [AdminEntities.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/AdminEntities.cs#L30-L55) |
| 14 | `transport_options` | `id` (int) | `itinerary_item_id` $\to$ `itinerary_items(id)` | `mode` (varchar: Train/Bus/Private), `carrier` (varchar), `origin`, `destination` (varchar), `estimated_duration` (int), `cost` (decimal) | M:1 with `itinerary_items` | [TripEntities.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/TripEntities.cs#L165-L185) |
| 15 | `bookings` | `id` (int) | `user_id` $\to$ `users(id)`, `trip_id` $\to$ `trips(id)` | `booking_reference` (varchar), `amount` (decimal), `payment_status` (varchar), `booking_date` (timestamptz) | M:1 with `users`, M:1 with `trips` | [AdminEntities.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/AdminEntities.cs#L60-L80) |
| 16 | `chatbot_packages` | `id` (int) | None | `name` (varchar), `price` (decimal), `token_limit` (int), `validity_days` (int) | 1:M with `chatbot_package_purchases` | [AdminEntities.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/AdminEntities.cs#L110-L130) |
| 17 | `chatbot_package_purchases` | `id` (int) | `user_id` $\to$ `users(id)`, `package_id` $\to$ `chatbot_packages(id)` | `purchased_at` (timestamptz), `tokens_remaining` (int), `is_active` (bool) | M:1 with `users`, M:1 with `chatbot_packages` | [AdminEntities.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/AdminEntities.cs#L135-L155) |
| 18 | `ai_chat_sessions` | `id` (int) | `user_id` $\to$ `users(id)` | `session_uuid` (uuid), `started_at` (timestamptz), `total_messages` (int) | M:1 with `users` | [AdminEntities.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/AdminEntities.cs#L160-L175) |
| 19 | `ai_photo_queries` | `id` (int) | `user_id` $\to$ `users(id)` | `image_url` (text), `identified_landmark` (varchar), `confidence` (float), `queried_at` | M:1 with `users` | [AdminEntities.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/AdminEntities.cs#L180-L195) |
| 20 | `reviews` | `id` (int) | `user_id` $\to$ `users(id)`, `destination_id` $\to$ `destinations(id)` | `rating` (int), `comment` (text), `status` (varchar: Pending/Approved/Flagged), `created_at` | M:1 with `users`, M:1 with `destinations` | [AdminEntities.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/AdminEntities.cs#L200-L220) |
| 21 | `chatbot_payments` | `id` (int) | `user_id` $\to$ `users(id)` | `transaction_id` (varchar), `amount` (decimal), `currency` (varchar), `status` (varchar), `payment_date` | M:1 with `users` | [AdminEntities.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/AdminEntities.cs#L225-L245) |
| 22 | `promo_payments` | `id` (int) | `user_id` $\to$ `users(id)` | `promo_code` (varchar), `discount_applied` (decimal), `final_amount` (decimal), `transaction_date` | M:1 with `users` | [AdminEntities.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/AdminEntities.cs#L250-L270) |
| 23 | `promo_codes` | `id` (int) | None | `code` (varchar, unique), `discount_percentage` (decimal), `valid_until` (date), `max_uses` (int) | 1:M with `promo_code_usages` | [AdminEntities.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/AdminEntities.cs#L275-L290) |
| 24 | `promo_code_usages` | `id` (int) | `promo_code_id` $\to$ `promo_codes(id)`, `user_id` $\to$ `users(id)` | `used_at` (timestamptz) | M:1 with `promo_codes`, M:1 with `users` | [AdminEntities.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/AdminEntities.cs#L295-L310) |

### Database Seeding
* Seeded via `DbInitializer.cs` ([DbInitializer.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Data/DbInitializer.cs)):
  * 4 Destinations: Galle Fort, Kandy Cultural Capital, Sigiriya Ancient Fortress, Ella Scenic Highlands.
  * 12 Cultural & Adventure Activities.
  * 8 Public Bus Routes (e.g., Route 01 Colombo-Kandy, Route 02 Colombo-Galle, Route EX01 Highway Express).
  * 6 Sri Lanka Railways Schedules (e.g., Podi Menike 1005 Colombo-Badulla, Ruhunu Kumari 8056 Colombo-Matara).
  * 3 AI Chatbot Token Packages (Explorer, Adventurer, Globetrotter).
  * Default users: Admin (`admin@novatours.com`), Operator (`operator@novatours.com`), Tourist (`tourist@novatours.com`).

---

# PART 7 — API ANALYSIS

### Complete Endpoint Registry

| HTTP | Route | Controller | Purpose | Auth | Role | Request Body | Response Body | Database/Service | Status |
|---|---|---|---|---|---|---|---|---|---|
| `POST` | `/api/auth/register` | `AuthController` | User registration | Anonymous | Any | `RegisterDto` (Name, Email, Password, Role) | `AuthResponseDto` (Token, User) | `users` | Implemented |
| `POST` | `/api/auth/login` | `AuthController` | User login & JWT issue | Anonymous | Any | `LoginDto` (Email, Password) | `AuthResponseDto` (Token, User) | `users` | Implemented |
| `GET` | `/api/trips` | `TripsController` | Get user trips | JWT | Tourist, Operator | None | `List<TripDto>` | `trips`, `TripService` | Implemented |
| `GET` | `/api/trips/{id}` | `TripsController` | Get trip by ID | JWT | Tourist, Operator | None | `TripDto` | `trips`, `TripService` | Implemented |
| `POST` | `/api/trips` | `TripsController` | Create new trip | JWT | Tourist | `CreateTripDto` (Destination, Dates, Budget, Style) | `TripDto` | `trips`, `TripService` | Implemented |
| `PUT` | `/api/trips/{id}` | `TripsController` | Update trip details | JWT | Tourist | `UpdateTripDto` | `TripDto` | `trips`, `TripService` | Implemented |
| `DELETE` | `/api/trips/{id}` | `TripsController` | Delete trip | JWT | Tourist | None | `204 No Content` | `trips`, `TripService` | Implemented |
| `POST` | `/api/itinerary-generation/plan` | `ItineraryGenerationController` | Trigger 4-agent AI itinerary creation | JWT | Tourist | `PlanRequestDto` (TripId) | `WorkflowResponseDto` | `ItineraryGenerationService` | Implemented |
| `GET` | `/api/itinerary-generation/status/{workflowId}` | `ItineraryGenerationController` | Get AI workflow status & progress | JWT | Tourist | None | `WorkflowStatusDto` | `itinerary_generation_workflows` | Implemented |
| `GET` | `/api/itineraries/{id}` | `ItinerariesController` | Get full itinerary with days/items | JWT | Tourist, Operator | None | `ItineraryDto` | `itineraries`, `itinerary_days` | Implemented |
| `PUT` | `/api/itineraries/{id}/approve` | `ItinerariesController` | Approve itinerary (Tourist/Operator) | JWT | Tourist, Operator | `ApprovalDto` (Comments) | `ApprovalResultDto` | `ApprovalService` | Implemented |
| `PUT` | `/api/itineraries/{id}/reject` | `ItinerariesController` | Reject itinerary | JWT | Tourist, Operator | `RejectionDto` (Reason) | `ApprovalResultDto` | `ApprovalService` | Implemented |
| `PUT` | `/api/itineraries/{id}/request-revision` | `ItinerariesController` | Request revision with notes | JWT | Tourist, Operator | `RevisionDto` (Notes) | `ApprovalResultDto` | `ApprovalService` | Implemented |
| `POST` | `/api/transport/search/transit` | `TransportController` | Search bus/train transit options | JWT | Tourist | `TransitSearchDto` (Origin, Dest, Date) | `TransitResultDto` | `TransportService`, `GoogleMaps` | Implemented |
| `POST` | `/api/transport/select` | `TransportController` | Attach transit option to itinerary item | JWT | Tourist | `SelectTransportDto` | `TransportOptionDto` | `transport_options` | Implemented |
| `DELETE` | `/api/transport/{id}` | `TransportController` | Remove transit option | JWT | Tourist | None | `204 No Content` | `transport_options` | Implemented |
| `GET` | `/api/destinations` | `DestinationsController` | List verified destinations | Anonymous | Any | None | `List<DestinationDto>` | `destinations` | Implemented |
| `GET` | `/api/destinations/{id}` | `DestinationsController` | Get destination details | Anonymous | Any | None | `DestinationDto` | `destinations`, `activities` | Implemented |
| `GET` | `/api/admin/dashboard/stats` | `AdminController` | Get administrative KPI metrics | JWT | Admin | None | `AdminDashboardStatsDto` | Aggregate queries | Implemented |
| `GET` | `/api/admin/users` | `AdminController` | Get all users with filters | JWT | Admin | Query params | `List<AdminUserDto>` | `users` | Implemented |
| `POST` | `/api/admin/users` | `AdminController` | Create user | JWT | Admin | `CreateUserDto` | `AdminUserDto` | `users` | Implemented |
| `PUT` | `/api/admin/users/{id}` | `AdminController` | Update user role / status | JWT | Admin | `UpdateUserDto` | `AdminUserDto` | `users` | Implemented |
| `DELETE` | `/api/admin/users/{id}` | `AdminController` | Deactivate/delete user | JWT | Admin | None | `204 No Content` | `users` | Implemented |
| `GET` | `/api/admin/destinations` | `AdminController` | Manage destinations | JWT | Admin | Query params | `List<DestinationDto>` | `destinations` | Implemented |
| `POST` | `/api/admin/destinations` | `AdminController` | Create destination | JWT | Admin | `CreateDestinationDto` | `DestinationDto` | `destinations` | Implemented |
| `GET` | `/api/admin/transportation/bus-routes` | `AdminTransportationController` | List all bus routes | JWT | Admin | None | `List<BusRoute>` | `bus_routes` | Implemented |
| `POST` | `/api/admin/transportation/bus-routes` | `AdminTransportationController` | Add bus route | JWT | Admin | `BusRouteDto` | `BusRoute` | `bus_routes` | Implemented |
| `PUT` | `/api/admin/transportation/bus-routes/{id}` | `AdminTransportationController` | Update bus route | JWT | Admin | `BusRouteDto` | `BusRoute` | `bus_routes` | Implemented |
| `DELETE` | `/api/admin/transportation/bus-routes/{id}` | `AdminTransportationController` | Delete bus route | JWT | Admin | None | `204 No Content` | `bus_routes` | Implemented |
| `GET` | `/api/admin/transportation/train-schedules` | `AdminTransportationController` | List train schedules | JWT | Admin | None | `List<TrainSchedule>` | `train_schedules` | Implemented |
| `POST` | `/api/admin/transportation/train-schedules` | `AdminTransportationController` | Add train schedule | JWT | Admin | `TrainScheduleDto` | `TrainSchedule` | `train_schedules` | Implemented |
| `GET` | `/api/admin/ai/workflows` | `AdminController` | List AI generation workflows | JWT | Admin | Query params | `List<WorkflowDto>` | `itinerary_generation_workflows` | Implemented |
| `GET` | `/api/admin/ai/workflows/{id}/logs` | `AdminController` | Get agent step execution logs | JWT | Admin | None | `List<WorkflowAuditLog>` | `workflow_audit_logs` | Implemented |
| `POST` | `/api/admin/ai/workflows/{id}/retry` | `AdminController` | Trigger workflow retry | JWT | Admin | None | `WorkflowResponseDto` | `ItineraryGenerationService` | Implemented |
| `GET` | `/api/admin/chatbot-payments` | `AdminController` | List chatbot token purchases | JWT | Admin | None | `List<ChatbotPayment>` | `chatbot_payments` | Implemented |
| `GET` | `/api/admin/promo-payments` | `AdminController` | List promotional payments | JWT | Admin | None | `List<PromoPayment>` | `promo_payments` | Implemented |
| `GET` | `/api/admin/reviews` | `AdminController` | Moderate reviews | JWT | Admin | Query params | `List<ReviewDto>` | `reviews` | Implemented |

---

# PART 8 — REACT WEB APPLICATION

### Architecture & Folder Structure
* **Root:** `frontend/`
* **Source Structure:**
  * `src/pages/`: Public, Tourist, Operator, and Admin view components.
  * `src/pages/admin/`: 14 dedicated administrative suite pages.
  * `src/components/`: Reusable navigation bars, footer, route guards (`AdminRoute.tsx`, `ProtectedRoute.tsx`), modals, and statistics cards.
  * `src/context/`: `useAuth.tsx` supplying global JWT session state and user profiles.
  * `src/services/`: HTTP abstraction modules (`api.ts`, `adminService.ts`, `transportService.ts`, `novaGuideService.ts`).
  * `src/types/`: TypeScript definitions (`admin.ts`, `index.ts`).

### React Pages & Components Table

| Page / Component | Purpose | Target Role | API Used | Main Features | File Path |
|---|---|---|---|---|---|
| **LandingPage** | Public showcase & hero discovery | Public, Tourist | `GET /api/destinations` | Destination spotlights, feature grid, AI planner teaser | [LandingPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/LandingPage.tsx) |
| **LoginPage** | User authentication & role routing | Public | `POST /api/auth/login`, `POST /api/auth/register` | Dual-mode login/register, token storage, automatic redirection | [LoginPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/LoginPage.tsx) |
| **TripsPage** | User trips & itinerary hub | Tourist, Operator | `GET /api/trips`, `PUT /api/itineraries/{id}/approve` | Trip list, status filters, approval/revision actions, budget view | [TripsPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/TripsPage.tsx) |
| **AITripPlannerPage** | Autonomous AI trip planning wizard | Tourist | `POST /api/itinerary-generation/plan`, `GET /status` | Multi-step criteria wizard, real-time agent generation timeline, generated schedule preview | [AITripPlannerPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/AITripPlannerPage.tsx) |
| **ManualTripPlannerPage** | Custom day-by-day trip builder | Tourist | `POST /api/trips`, `POST /api/itinerary-items` | Manual day creation, activity picker, time slot configuration | [ManualTripPlannerPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/ManualTripPlannerPage.tsx) |
| **AdminDashboardPage** | Platform operations overview | Admin | `GET /api/admin/dashboard/stats`, `GET /system-activities` | KPI stat cards (Users, Trips, Revenue, AI Success Rate), quick links, recent activity feed | [AdminDashboardPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/admin/AdminDashboardPage.tsx) |
| **AdminUsersPage** | User directory and access control | Admin | `GET/POST/PUT/DELETE /api/admin/users` | User search, role badge toggling, account activation/deactivation modal | [AdminUsersPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/admin/AdminUsersPage.tsx) |
| **AdminDestinationsPage** | Verified destination inventory | Admin | `GET/POST/PUT/DELETE /api/admin/destinations` | Destination catalog, image preview, add/edit modal, region tags | [AdminDestinationsPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/admin/AdminDestinationsPage.tsx) |
| **AdminAttractionsPage** | Attraction point-of-interest CRUD | Admin | `GET/POST/PUT/DELETE /api/admin/attractions` | Destination-linked attraction list, GPS coordinates, opening hours, ticket pricing | [AdminAttractionsPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/admin/AdminAttractionsPage.tsx) |
| **AdminActivitiesPage** | Touristic activity directory | Admin | `GET/POST/PUT/DELETE /api/admin/activities` | Activity cost, duration in minutes, category assignment | [AdminActivitiesPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/admin/AdminActivitiesPage.tsx) |
| **AdminTransportationPage** | Public bus & train transit suite | Admin | `GET/POST/PUT/DELETE /api/admin/transportation/*` | Bus route manager, train schedule manager, transit metric counters | [AdminTransportationPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/admin/AdminTransportationPage.tsx) |
| **AdminAIWorkflowsPage** | AI agent workflow tracer & debugger | Admin | `GET /api/admin/ai/workflows`, `GET /logs`, `POST /retry` | State badge inspector, step-by-step audit logs with payload drawer, retry trigger | [AdminAIWorkflowsPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/admin/AdminAIWorkflowsPage.tsx) |
| **AdminChatbotPaymentsPage** | Chatbot package transactions | Admin | `GET /api/admin/chatbot-payments` | Transaction ledger, package breakdown, revenue summary | [AdminChatbotPaymentsPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/admin/AdminChatbotPaymentsPage.tsx) |
| **AdminReviewsPage** | Content moderation dashboard | Admin | `GET/PUT /api/admin/reviews` | Tourist review moderation, approval/flagging controls, rating distribution | [AdminReviewsPage.tsx](file:///c:/Users/user/NOVA/frontend/src/pages/admin/AdminReviewsPage.tsx) |

---

# PART 9 — FLUTTER MOBILE APPLICATION

### Architecture & Folder Structure
* **Root:** `mobile/`
* **Framework:** Flutter (Dart `>=3.0.0 <4.0.0`)
* **State Management:** Provider pattern (`ChangeNotifierProvider`, `provider: ^6.1.2`)
* **Key Packages:** `http: ^1.2.1`, `google_fonts: ^6.2.1`, `intl: ^0.19.0`
* **Source Structure:**
  * `lib/main.dart`: App entry point, Material 3 theme configuration, bottom navigation bar.
  * `lib/screens/home_screen.dart`: Featured destinations, quick action cards, upcoming trip banner.
  * `lib/screens/ai_planner_screen.dart`: AI trip generation input form and plan summary.
  * `lib/screens/bookings_screen.dart`: Active bookings and tour reservations.
  * `lib/services/api_service.dart`: HTTP REST communication client with fallback mock handlers.

### Flutter Screens Table

| Screen | Purpose | Target Role | API Integrated | Main Functionality | File Path |
|---|---|---|---|---|---|
| **HomeScreen** | Mobile dashboard & discovery | Tourist | `GET /api/destinations` | Search bar, category chips (Beaches, Culture, Wildlife), destination carousel, bottom navigation | [home_screen.dart](file:///c:/Users/user/NOVA/mobile/lib/screens/home_screen.dart) |
| **AIPlannerScreen** | Mobile AI itinerary generation | Tourist | `POST /api/itinerary-generation/plan` | Form fields (destination, duration, travel style, budget), generation trigger, timeline card preview | [ai_planner_screen.dart](file:///c:/Users/user/NOVA/mobile/lib/screens/ai_planner_screen.dart) |
| **BookingsScreen** | Travel reservations & history | Tourist | `GET /api/bookings` | Booking cards, confirmation badges, date and cost summary | [bookings_screen.dart](file:///c:/Users/user/NOVA/mobile/lib/screens/bookings_screen.dart) |

### Device Features Analysis
* **Date & Time Picker:** Implemented via standard Flutter Material widgets (`showDatePicker`).
* **GPS / Location Sensors:** `NOT IMPLEMENTED` (no `geolocator` or `location` dependencies in `pubspec.yaml`).
* **Camera / Image Picker:** `NOT IMPLEMENTED` (no `camera` or `image_picker` dependencies).
* **Push Notifications:** `NOT IMPLEMENTED` (no Firebase Cloud Messaging or local notifications package).
* **Mobile Authentication / Token Storage:** `NOT IMPLEMENTED` in Flutter client (hardcoded tourist identifier used in API service).

---

# PART 10 — AGENTIC AI SYSTEM

### Orchestration Architecture
The production agentic workflow is implemented in C# inside `Nova.Api/Services/Agents/TourismAgents.cs` and orchestrated by `ItineraryGenerationService.cs`. In addition, an exploratory LangGraph/Gemini 1.5 Python prototype is preserved in `ai-agents/`.

```
[Tourist Submits Trip Constraints]
           │
           ▼
[ItineraryGenerationService] ── creates ──► [ItineraryGenerationWorkflow (State: Planning)]
           │
           ▼
1. [TravelPlanningAgent]
     • Decomposes trip into distinct day schedules
     • Computes pace and target activity counts
           │
           ▼ (State: Researching)
2. [DestinationResearchAgent]
     • Matches destination, category, and budget against DB activities
     • Selects candidate attractions
           │
           ▼ (State: CheckingLogistics)
3. [TravelLogisticsAgent]
     • Arranges time slots without chronological overlap
     • Queries transit options (bus routes / railway schedules)
           │
           ▼ (State: Validating)
4. [SafetyValidationAgent]
     • Evaluates weather feasibility, physical difficulty, and terrain alerts
     • Computes safety score (e.g., 96-98%)
           │
           ▼
[Deterministic ItineraryValidationService]
     • Checks budget overruns, time bounds, schedule collisions
           │
           ▼ (State: PendingApproval)
[Human-in-the-Loop Review]
     ├── Tourist / Operator approves ──► Status: Approved
     └── Operator requests revision  ──► Status: RevisionRequested
```

### Detailed Agent Specifications

#### 1. TravelPlanningAgent
* **Purpose:** Deconstructs the overall trip duration, budget, and travel style into daily itinerary buckets.
* **Input:** `Trip` entity (Destination, StartDate, EndDate, Budget, Travelers, TravelStyle).
* **Output:** Skeleton `DayPlan` structures with allocated daily spending targets and activity counts.
* **Tools Used:** In-memory date math, pacing calculator.
* **Called By:** `ItineraryGenerationService`.
* **Calls:** `DestinationResearchAgent`.
* **Validation:** Day count matches `(EndDate - StartDate).Days + 1`.
* **Persistence:** Logged in `workflow_audit_logs` (`ActionTaken = "CreatedDaySkeletons"`).
* **Source:** [TourismAgents.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/Agents/TourismAgents.cs#L25-L65).

#### 2. DestinationResearchAgent
* **Purpose:** Selects relevant activities and cultural sights matching the user's travel style and destination.
* **Input:** Destination name, travel style, remaining daily budget.
* **Output:** Curated list of candidate `Activity` entities with costs and durations.
* **Tools Used:** `NovaDbContext.Activities` query filter.
* **Called By:** `TravelPlanningAgent` / Orchestrator.
* **Calls:** `TravelLogisticsAgent`.
* **Validation:** Activity costs within budget limits.
* **Persistence:** Logged in `workflow_audit_logs` (`ActionTaken = "MatchedActivities"`).
* **Source:** [TourismAgents.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/Agents/TourismAgents.cs#L70-L115).

#### 3. TravelLogisticsAgent
* **Purpose:** Arranges activities into conflict-free time slots and identifies inter-activity transit options.
* **Input:** Day skeleton and candidate activities.
* **Output:** Sequenced `ItineraryItem` items with explicit `StartTime`, `EndTime`, and transit modes.
* **Tools Used:** Time sequence scheduler, `TransportService` transit query.
* **Called By:** Orchestrator.
* **Calls:** `SafetyValidationAgent`.
* **Validation:** $EndTime_i \le StartTime_{i+1}$, total transit time within daily tolerance.
* **Persistence:** Logged in `workflow_audit_logs` (`ActionTaken = "SequencedActivitiesAndTransit"`).
* **Source:** [TourismAgents.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/Agents/TourismAgents.cs#L120-L175).

#### 4. SafetyValidationAgent
* **Purpose:** Evaluates physical difficulty, seasonal monsoon/weather risks, and terrain hazards for the destination.
* **Input:** Generated day items and destination geographical profile.
* **Output:** `SafetyAssessment` containing a safety score (0-100%), advisory warnings, and terrain notices.
* **Tools Used:** Regional risk heuristics matrix.
* **Called By:** Orchestrator.
* **Calls:** `ItineraryValidationService`.
* **Validation:** Safety score must exceed minimum threshold ($\ge 70\%$).
* **Persistence:** Logged in `workflow_audit_logs` (`ActionTaken = "GeneratedSafetyAssessment"`).
* **Source:** [TourismAgents.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/Agents/TourismAgents.cs#L180-L225).

---

# PART 11 — THIRD-PARTY INTEGRATIONS

| Service Name | Purpose | Endpoint / Domain | Where Called | Data Sent | Data Received | Auth Method | Environment Variable | Error / Timeout Handling |
|---|---|---|---|---|---|---|---|---|
| **Google Maps Directions API** | Multi-modal transit route calculation | `https://maps.googleapis.com/maps/api/directions/json` | Backend (`GoogleTransportService.cs`) | Origin, Destination, Transit Mode, Departure Time | Route segments, duration in seconds, step directions, transit details | Query parameter `?key=...` | `GoogleMaps:ApiKey` / `GOOGLE_MAPS_API_KEY` | HTTP `HttpClient` timeout configured; on non-success or exception, falls back to internal Sri Lanka bus/train tables |
| **Google Gemini API** | LLM text generation and RAG reasoning | `generativelanguage.googleapis.com` | Python prototype (`ai-agents/`) | User travel prompts, RAG document context | Structured JSON itinerary plan | API Key Header | `GOOGLE_API_KEY` | Exception block with fallback static response |

---

# PART 12 — SECURITY ANALYSIS

| Security Domain | Implementation Details | Evidence | Status |
|---|---|---|---|
| **Authentication** | JWT Bearer Authentication using HMAC-SHA256 tokens issued on login | [Program.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Program.cs#L35-L55), [AuthController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/AuthController.cs#L85-L115) | **Implemented** |
| **Authorization (RBAC)** | Role claims validated via `[Authorize(Roles = "Admin")]` and `[Authorize(Roles = "Tourist,TourismOperator")]` | [AdminController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/AdminController.cs#L12), [ItinerariesController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/ItinerariesController.cs#L15) | **Implemented** |
| **Password Hashing** | Cryptographic hash with random salt | [AuthController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/AuthController.cs#L120-L135) | **Implemented** |
| **SQL Injection Defense** | Parameterized queries and LINQ expressions via Entity Framework Core Npgsql | [NovaDbContext.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Data/NovaDbContext.cs) | **Implemented** |
| **CORS Configuration** | Explicit CORS policy permitting frontend dev server origins (`http://localhost:5173`, `http://localhost:3000`) | [Program.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Program.cs#L60-L72) | **Implemented** |
| **Secret Management** | Connection strings and JWT keys loaded from environment variables and `appsettings.json` | [appsettings.json](file:///c:/Users/user/NOVA/backend/Nova.Api/appsettings.json) | **Implemented** |
| **Input Validation** | Data Annotations (`[Required]`, `[Range]`, `[EmailAddress]`) on all API request DTOs | [TripDto.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/DTOs/TripDto.cs) | **Implemented** |
| **Mobile Auth Gaps** | Flutter mobile client lacks JWT token storage and login screen | [mobile/lib/services/api_service.dart](file:///c:/Users/user/NOVA/mobile/lib/services/api_service.dart) | **Security Gap** |
| **Rate Limiting** | Rate limiting middleware not registered in ASP.NET Core pipeline | [Program.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Program.cs) | **Security Gap** |

---

# PART 13 — TESTING ANALYSIS

### Test Suite Execution Summary
The backend repository contains a dedicated xUnit test project: `backend/Nova.Tests/Nova.Tests.csproj`.
All **41 automated tests PASS** (execution time: ~3.69s).

```
Passed!  - Failed: 0, Passed: 41, Skipped: 0, Total: 41, Duration: 3.69s
```

### Complete Test Registry Table

| Test Name | Test Type | Feature Tested | Expected Result | Actual Result | File Path |
|---|---|---|---|---|---|
| `Approve_AsOperator_SetsApprovedStatus` | Unit / Service | Operator approval | Status = `Approved`, notes persisted | **PASSED** | [ApprovalServiceTests.cs](file:///c:/Users/user/NOVA/backend/Nova.Tests/Services/ApprovalServiceTests.cs#L20) |
| `Reject_AsTourist_SetsRejectedStatus` | Unit / Service | Tourist rejection | Status = `Rejected` | **PASSED** | [ApprovalServiceTests.cs](file:///c:/Users/user/NOVA/backend/Nova.Tests/Services/ApprovalServiceTests.cs#L50) |
| `Reject_AsOperator_RequiresReason` | Unit / Service | Operator rejection validation | Throws validation error if reason is empty | **PASSED** | [ApprovalServiceTests.cs](file:///c:/Users/user/NOVA/backend/Nova.Tests/Services/ApprovalServiceTests.cs#L75) |
| `GeneratePlanAsync_ExecutesAllFourAgents` | Integration | 4-Agent Pipeline | Workflow completed, audit logs written for all 4 agents | **PASSED** | [ItineraryGenerationServiceTests.cs](file:///c:/Users/user/NOVA/backend/Nova.Tests/Services/ItineraryGenerationServiceTests.cs#L25) |
| `GeneratePlanAsync_UnauthorizedUser_Throws` | Unit / Security | Trip ownership check | UnauthorizedAccessException thrown | **PASSED** | [ItineraryGenerationServiceTests.cs](file:///c:/Users/user/NOVA/backend/Nova.Tests/Services/ItineraryGenerationServiceTests.cs#L65) |
| `Validate_BudgetExceeded_ReturnsError` | Unit / Validation | Budget rule | Validation failure flagged | **PASSED** | [ItineraryValidationServiceTests.cs](file:///c:/Users/user/NOVA/backend/Nova.Tests/Services/ItineraryValidationServiceTests.cs#L20) |
| `Validate_DateOutOfBounds_ReturnsError` | Unit / Validation | Date boundary rule | Items outside trip dates rejected | **PASSED** | [ItineraryValidationServiceTests.cs](file:///c:/Users/user/NOVA/backend/Nova.Tests/Services/ItineraryValidationServiceTests.cs#L45) |
| `Validate_OverlappingActivities_ReturnsError` | Unit / Validation | Time conflict check | Schedule collision flagged | **PASSED** | [ItineraryValidationServiceTests.cs](file:///c:/Users/user/NOVA/backend/Nova.Tests/Services/ItineraryValidationServiceTests.cs#L70) |
| `Validate_ValidItinerary_ReturnsSuccess` | Unit / Validation | Valid itinerary | IsValid = true, Score $\ge$ 90 | **PASSED** | [ItineraryValidationServiceTests.cs](file:///c:/Users/user/NOVA/backend/Nova.Tests/Services/ItineraryValidationServiceTests.cs#L95) |
| `Validate_ExcessiveTravelTime_ReturnsWarning` | Unit / Validation | Transit feasibility | Warning issued if travel $> 5$ hrs | **PASSED** | [ItineraryValidationServiceTests.cs](file:///c:/Users/user/NOVA/backend/Nova.Tests/Services/ItineraryValidationServiceTests.cs#L120) |
| `TravelPlanningAgent_CreatesCorrectDayCount` | Unit / Agent | Day decomposition | Exactly N day plans created | **PASSED** | [TourismAgentsTests.cs](file:///c:/Users/user/NOVA/backend/Nova.Tests/Services/TourismAgentsTests.cs#L15) |
| `DestinationResearchAgent_FiltersByStyle` | Unit / Agent | Activity selection | Activities match style & destination | **PASSED** | [TourismAgentsTests.cs](file:///c:/Users/user/NOVA/backend/Nova.Tests/Services/TourismAgentsTests.cs#L40) |
| `TravelLogisticsAgent_NoOverlappingSlots` | Unit / Agent | Activity sequencing | Consecutive time slots strictly monotonic | **PASSED** | [TourismAgentsTests.cs](file:///c:/Users/user/NOVA/backend/Nova.Tests/Services/TourismAgentsTests.cs#L65) |
| `SafetyValidationAgent_ComputesValidScore` | Unit / Agent | Risk assessment | Safety score between 0 and 100 | **PASSED** | [TourismAgentsTests.cs](file:///c:/Users/user/NOVA/backend/Nova.Tests/Services/TourismAgentsTests.cs#L90) |
| `SearchTransit_ReturnsBusAndTrain_WhenAvailable` (20 transit tests) | Service / Mock | Public transit search | Correct routes matched; Google fallback tested | **PASSED** (20 tests) | [TransportServiceTests.cs](file:///c:/Users/user/NOVA/backend/Nova.Tests/Services/TransportServiceTests.cs) |
| `CreateTrip_ValidModel_SavesTrip` (7 trip tests) | Unit / Service | Trip CRUD & constraints | Budget $>0$, travelers $>0$, date ordering | **PASSED** (7 tests) | [TripServiceTests.cs](file:///c:/Users/user/NOVA/backend/Nova.Tests/Services/TripServiceTests.cs) |

* **Frontend Unit Tests:** 4 tests implemented in `frontend/src/tests/app.test.ts` (executes via `node --test src/tests/app.test.ts` - all PASS).
* **Flutter Mobile Tests:** `NOT IMPLEMENTED` (no tests in `mobile/test/`).

---

# PART 14 — AGENTIC AI EVALUATION

| Requirement | Existing Evidence | File / Location | Status |
|---|---|---|---|
| **Golden Test Cases** | 8 golden evaluation scenarios implemented in Python suite | [ai-agents/tests_verification.py](file:///c:/Users/user/NOVA/ai-agents/tests_verification.py) | **Implemented** |
| **Deterministic Validation** | C# rules testing budget limit, time collisions, date ranges | [ItineraryValidationService.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/ItineraryValidationService.cs) | **Implemented** |
| **Workflow State Machine** | Explicit states (`Pending` $\to$ `Planning` $\to$ `Researching` $\to$ `CheckingLogistics` $\to$ `Validating` $\to$ `PendingApproval`) | [TripEntities.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Models/TripEntities.cs#L100-L120) | **Implemented** |
| **Audit Log Trail** | Step-by-step agent logs recorded in `workflow_audit_logs` | [ItineraryGenerationService.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/ItineraryGenerationService.cs#L75-L115) | **Implemented** |
| **Human Approval Enforcement** | Generated itineraries cannot reach `Approved` without explicit tourist or operator action | [ApprovalService.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/ApprovalService.cs) | **Implemented** |
| **Prompt-Injection Resistance** | System prompts in Python prototype enforce structured output; C# pipeline uses strongly-typed DTOs | [ai-agents/agents/](file:///c:/Users/user/NOVA/ai-agents/agents/) | **Partially Implemented** |
| **Benchmark Quantitative Scores** | Formal LLM benchmark numbers (e.g., BLEU, ROUGE, LLM-as-a-judge scorecards) | Not found in repository | **NOT FOUND / CANNOT VERIFY** |

---

# PART 15 — PERFORMANCE ANALYSIS

* **Repository Finding:** No performance testing configurations, Apache JMeter (`.jmx`) test plans, k6 scripts, or load test results exist in the repository.
* **Formal Status:** `Performance evidence not found.`

---

# PART 16 — DEPLOYMENT ANALYSIS

| Component | Target Platform | URL if Present | Configuration | Status | Evidence |
|---|---|---|---|---|---|
| **Backend API** | Localhost / ASP.NET Kestrel | `http://localhost:5000` | Configured via `launchSettings.json` and `Program.cs` | Local Dev Ready | [launchSettings.json](file:///c:/Users/user/NOVA/backend/Nova.Api/Properties/launchSettings.json) |
| **PostgreSQL** | Local PostgreSQL | `localhost:5432/nova_tourism` | `ConnectionStrings:DefaultConnection` | Local Dev Ready | [appsettings.json](file:///c:/Users/user/NOVA/backend/Nova.Api/appsettings.json) |
| **Web Frontend** | Vite Dev Server | `http://localhost:5173` | Configured via `vite.config.ts` | Local Dev Ready | [vite.config.ts](file:///c:/Users/user/NOVA/frontend/vite.config.ts) |
| **Mobile App** | Android / iOS / Web | Local Debugger | Flutter Gradle build files | Local Dev Ready | [pubspec.yaml](file:///c:/Users/user/NOVA/mobile/pubspec.yaml) |
| **Cloud Deployment** | Cloud PaaS (Azure/AWS) | None | No Dockerfiles, Helm charts, or Terraform found | **NOT IMPLEMENTED** | Repo root analysis |

---

# PART 17 — GITHUB / CI/CD ANALYSIS

### CI/CD Workflow (`.github/workflows/ci.yml`)
The repository contains an automated GitHub Actions workflow file that validates all three tiers on every push and pull request to `main` and `Trip-and-Itinerary-Management`:

```yaml
name: TravelLink CI Pipeline
on:
  push:
    branches: [ main, Trip-and-Itinerary-Management ]
  pull_request:
    branches: [ main, Trip-and-Itinerary-Management ]
```

1. **Job 1: `backend-net`**
   * Sets up .NET 8.0 SDK.
   * Executes `dotnet restore`, `dotnet build --configuration Release --no-restore`.
   * Executes `dotnet test --no-build --verbosity normal` running all 41 xUnit tests.
2. **Job 2: `frontend-react`**
   * Sets up Node.js 20.x.
   * Executes `npm ci` and `npm run build` validating TypeScript and Vite bundling.
3. **Job 3: `mobile-flutter`**
   * Sets up Flutter stable channel.
   * Executes `flutter pub get` and `flutter analyze`.

### Missing Repository Items:
* Issue Templates (`.github/ISSUE_TEMPLATE/`): `NOT FOUND`
* Pull Request Template (`.github/PULL_REQUEST_TEMPLATE.md`): `NOT FOUND`
* CODEOWNERS: `NOT FOUND`
* Continuous Deployment (CD) / Auto-deploy Step: `NOT IMPLEMENTED`

---

# PART 18 — ARCHITECTURE DECISION RECORDS (ADR)

### ADR-001: React State Management
* **Context:** The frontend requires global state for user authentication, role enforcement, and token management across standard user pages and 14 admin pages.
* **Problem:** Selecting between Redux Toolkit, Zustand, or React Context API.
* **Decision:** Implemented **React Context API (`useAuth.tsx`)** paired with localized component state (`useState`) and modular service layer (`adminService.ts`).
* **Rationale:** Reduces boilerplate overhead, eliminates external state dependencies, and satisfies the session lifecycle requirements.
* **Consequences:** Lightweight and fast, but requires careful context separation if real-time multi-agent streaming state expands.
* **Evidence:** [useAuth.tsx](file:///c:/Users/user/NOVA/frontend/src/context/useAuth.tsx).

### ADR-002: Flutter State Management
* **Context:** The mobile application needs to manage navigation state, trip planning inputs, and API responses.
* **Problem:** Choosing between Bloc, Riverpod, or Provider.
* **Decision:** Implemented **Provider Pattern (`provider: ^6.1.2`)**.
* **Rationale:** Supported natively by Flutter team recommendations; provides clean separation of UI and business logic without excessive boilerplate.
* **Consequences:** Sufficient for current 3-screen scope; would need structured repository patterns if offline caching is introduced.
* **Evidence:** [pubspec.yaml](file:///c:/Users/user/NOVA/mobile/pubspec.yaml#L35), [main.dart](file:///c:/Users/user/NOVA/mobile/lib/main.dart).

### ADR-003: Agentic AI Framework & Orchestration
* **Context:** Multi-agent trip generation requires planning, attraction selection, transit routing, and safety validation with deterministic reliability.
* **Problem:** Choosing between external Python microservice (LangGraph) vs. In-Process Native C# Orchestrator.
* **Decision:** Implemented **In-Process C# Orchestration Engine (`TourismAgents.cs`, `ItineraryGenerationService.cs`)** in the ASP.NET Core backend for production runtime, while keeping Python LangGraph as an experimental prototype.
* **Rationale:** Eliminates inter-process latency, simplifies single-container hosting, enables transactional database integration via EF Core, and provides type safety.
* **Consequences:** Python LangGraph prototype preserved in `ai-agents/` for research; production relies on C# multi-agent service.
* **Evidence:** [TourismAgents.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/Agents/TourismAgents.cs), [ItineraryGenerationService.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Services/ItineraryGenerationService.cs).

### ADR-004: Agent Workflow State & Database Strategy
* **Context:** Long-running multi-agent tasks must be inspectable by administrators and resilient against transient failures.
* **Problem:** Storing workflow state in memory vs. dedicated database tables.
* **Decision:** Implemented **Relational Workflow State & Audit Tables (`itinerary_generation_workflows`, `workflow_audit_logs`)** in PostgreSQL.
* **Rationale:** Guarantees persistence across server restarts, provides full auditability in the Admin Console, and enables workflow retry operations.
* **Consequences:** Slight database write overhead per agent step.
* **Evidence:** [NovaDbContext.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Data/NovaDbContext.cs), [AdminController.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Controllers/AdminController.cs#L365-L425).

### ADR-005: Cloud Deployment & API Gateway Architecture
* **Context:** Multi-client ecosystem (Web + Mobile) requires unified routing and data access.
* **Problem:** Direct client-to-database or client-to-AI vs. Centralized Web API Gateway.
* **Decision:** All clients communicate strictly through the **ASP.NET Core Web API Gateway**.
* **Rationale:** Enforces centralized JWT authentication, business validation, and audit logging.
* **Consequences:** API becomes the critical path; requires high availability in production.
* **Evidence:** [Program.cs](file:///c:/Users/user/NOVA/backend/Nova.Api/Program.cs), [api.ts](file:///c:/Users/user/NOVA/frontend/src/services/api.ts), [api_service.dart](file:///c:/Users/user/NOVA/mobile/lib/services/api_service.dart).

---

# PART 19 — DIAGRAM SPECIFICATIONS

### 1. System Architecture Diagram
* **Actors:** Tourist, Tourism Operator, System Administrator.
* **Frontend Layer:** React 19 SPA (`:5173`), Flutter Mobile Client.
* **Gateway & Backend:** ASP.NET Core 8 Web API (`:5000`) hosting Controllers, Auth Middleware, Services, and 4-Agent AI Engine.
* **Persistence & External:** PostgreSQL (`:5432`), Google Maps Transit REST API.
* **Data Flow:** Clients $\to$ HTTP/JSON with Bearer Token $\to$ Controllers $\to$ Services $\to$ EF Core $\to$ PostgreSQL.

### 2. Agentic AI Architecture Diagram
* **Orchestrator:** `ItineraryGenerationService`.
* **Nodes:**
  1. `TravelPlanningAgent`: Decomposes trip criteria $\to$ Day Skeletons.
  2. `DestinationResearchAgent`: Reads destination/category $\to$ Candidate Activities.
  3. `TravelLogisticsAgent`: Time slot assignment & Transit queries $\to$ Conflict-Free Schedule.
  4. `SafetyValidationAgent`: Weather & difficulty assessment $\to$ Safety Score.
  5. `ItineraryValidationService`: Hard constraint checks.
  6. `ApprovalService`: Human review state machine.

### 3. Entity-Relationship (ER) Diagram
* **Core Hub:** `users` (1:M `trips`, 1:M `itinerary_approvals`, 1:M `reviews`).
* **Trip Hierarchy:** `trips` (1:M `itineraries`) $\to$ `itineraries` (1:M `itinerary_days`) $\to$ `itinerary_days` (1:M `itinerary_items`) $\to$ `itinerary_items` (1:M `transport_options`, M:1 `activities`).
* **Destination Hub:** `destinations` (1:M `attractions`, 1:M `activities`, 1:M `reviews`).
* **Workflow Hub:** `trips` (1:M `itinerary_generation_workflows`) $\to$ `itinerary_generation_workflows` (1:M `workflow_audit_logs`).
* **Transit Hub:** Standalone indexed tables `bus_routes`, `train_schedules`.

### 4. Database Relational Schema Diagram
* Visual representation of 24 tables with primary keys (`PK`), foreign keys (`FK`), and unique constraints on `users.email`, `promo_codes.code`.

### 5. Use Case Diagram
* **Tourist Use Cases:** Register/Login, Plan Trip Manually, Trigger AI Itinerary Generation, View Transit Routes, Approve/Reject Itinerary, Submit Review.
* **Operator Use Cases:** View Assigned Regional Trips, Evaluate Itinerary Safety, Approve Itinerary, Request Revision with Comments.
* **Admin Use Cases:** Manage Users, Verify Destinations & Attractions, Manage Bus & Train Schedules, Inspect AI Workflows & Retry, View Revenue Reports.

### 6. Component Diagram
* **Components:** `Presentation (React/Flutter)`, `API Controllers`, `Application Services`, `Agentic AI Engine`, `Data Access (EF Core)`, `Database (PostgreSQL)`.

### 7. AI Trip Planning Sequence Diagram
```
Tourist -> Web/Mobile: Submit Trip Criteria
Web/Mobile -> API: POST /api/itinerary-generation/plan
API -> Orchestrator: GeneratePlanAsync(tripId)
Orchestrator -> DB: Create Workflow (State=Planning)
Orchestrator -> TravelPlanningAgent: Execute(trip)
TravelPlanningAgent --> Orchestrator: DaySkeletons
Orchestrator -> DestinationResearchAgent: MatchActivities(dest, style)
DestinationResearchAgent --> Orchestrator: CandidateActivities
Orchestrator -> TravelLogisticsAgent: SequenceAndRoute(activities)
TravelLogisticsAgent -> TransportService: FindTransit(origin, dest)
TransportService --> TravelLogisticsAgent: TransitOptions
TravelLogisticsAgent --> Orchestrator: SequencedDays
Orchestrator -> SafetyValidationAgent: AssessRisks(itinerary)
SafetyValidationAgent --> Orchestrator: SafetyReport (Score=96%)
Orchestrator -> Validator: ValidateRules(itinerary)
Validator --> Orchestrator: Validated
Orchestrator -> DB: Save Itinerary (Status=PendingApproval)
Orchestrator --> API: Return Itinerary DTO
API --> Tourist: Display Itinerary for Human Approval
```

### 8. Normal Trip Creation Sequence Diagram
* `Tourist` $\to$ `TripsPage` $\to$ Fill Form $\to$ `POST /api/trips` $\to$ `TripService` $\to$ Save in `trips` table $\to$ Return `TripDto`.

### 9. AI Trip Planning Activity Diagram
* Start $\to$ Input Criteria $\to$ Validate Inputs $\to$ Generate Skeleton $\to$ Fetch Activities $\to$ Schedule Slots $\to$ Check Feasibility $\to$ Safety Assessment $\to$ Rule Validation Passed? (No $\to$ Adjust; Yes $\to$ Save) $\to$ Await Human Approval $\to$ End.

### 10. Deployment Diagram
* Node `Client Tier` (Browser / Android) $\to$ HTTPS $\to$ Node `Server Tier` (ASP.NET Core Web API on Linux/Windows Kestrel) $\to$ TCP 5432 $\to$ Node `Database Tier` (PostgreSQL Instance).

### 11. CI/CD Workflow Diagram
* Push to Git $\to$ GitHub Actions Runner $\to$ Parallel Matrix (`backend-net`, `frontend-react`, `mobile-flutter`) $\to$ Report Build & Test Status.

---

# PART 20 — REPORT SCREENSHOT / EVIDENCE REQUIREMENTS

| Group | Screen / Tool | What It Proves | Why It Should Be Included |
|---|---|---|---|
| **A. React** | `AdminAIWorkflowsPage.tsx` | Live multi-agent workflow monitoring, status badges, retry button | Proves implemented Agentic AI governance and observability |
| **A. React** | `AdminTransportationPage.tsx` | Bus and train route management tabs, search, metrics | Proves administrative transit governance |
| **A. React** | `AITripPlannerPage.tsx` | AI trip generation wizard and generated schedule | Proves Tourist AI itinerary generation feature |
| **B. Flutter** | `HomeScreen` on mobile emulator | Mobile destination cards, search, category chips | Proves cross-platform mobile UI implementation |
| **B. Flutter** | `AIPlannerScreen` | Mobile AI planning input form | Proves mobile AI integration |
| **C. Backend** | Swagger UI (`/swagger`) | All 35+ documented API endpoints | Proves complete REST API specification |
| **D. Database** | PostgreSQL pgAdmin / DBeaver | All 24 tables with snake_case naming | Proves EF Core schema and relational design |
| **E. AI Engine** | Terminal / Debugger log | 4 agents executing in sequence with audit logs | Proves autonomous multi-agent pipeline |
| **F. Testing** | Terminal output of `dotnet test` | **41 Passed, 0 Failed** | Proves software quality and business rule verification |
| **G. GitHub** | GitHub repository commit history | Individual commits across 4 team branches | Proves collaborative Git workflow |
| **H. CI/CD** | GitHub Actions execution tab | Green checkmarks for `backend-net`, `frontend-react` | Proves automated CI/CD pipeline |
| **I. Security** | Postman / Network Tab | JWT token in `Authorization: Bearer` header | Proves token-based authentication and RBAC |

---

# PART 21 — INDIVIDUAL CONTRIBUTION EXTRACTION

Extracted from Git commits, author emails, and branch structures:

### Student 1: Hiruni Praboda (`hirunipraboda28@gmail.com`)
* **Core Domain:** Trip and Itinerary Management, Admin Dashboard & Console.
* **Backend Contributions:** Implemented `TripsController`, `ItinerariesController`, `ItineraryGenerationController`, `AdminController`, `AdminTransportationController`, `ApprovalService`, `ItineraryValidationService`, `ItineraryGenerationService`.
* **Database Contributions:** Designed `trips`, `itineraries`, `itinerary_days`, `itinerary_items`, `itinerary_generation_workflows`, `workflow_audit_logs`, `itinerary_approvals`, `bus_routes`, `train_schedules`.
* **React Contributions:** Developed `AdminDashboardPage`, `AdminUsersPage`, `AdminTransportationPage`, `AdminAIWorkflowsPage`, `AITripPlannerPage`, `TripsPage`.
* **Testing & CI:** Created 41 backend xUnit tests in `Nova.Tests`; implemented `.github/workflows/ci.yml`.

### Student 2: Timali Jayasinghe (`timalinayodara@gmail.com`)
* **Core Domain:** Destination and Attraction Management.
* **Git Branch:** `origin/Destination-and-Attraction-Management`.
* **Backend Contributions:** Developed `DestinationsController`, attraction querying logic.
* **Database Contributions:** Designed `destinations` and `attractions` schema and relational mappings.
* **React Contributions:** Implemented `AdminDestinationsPage`, `AdminAttractionsPage`, and destination discovery showcase cards.

### Student 3: Nadeepa Malith (`malithnadeepa09@gmail.com` / `IT24100474`)
* **Core Domain:** Guide and Tour Operations.
* **Git Branch:** `origin/Guide-and-Tour-Operations`.
* **Backend Contributions:** Tour booking management endpoints, operator itinerary review logic.
* **Database Contributions:** Designed `bookings`, `chatbot_packages`, `chatbot_package_purchases`.
* **Frontend Contributions:** Developed `ToursPage`, `AdminBookingsPage`, `AdminAIGuidePage`.

### Student 4: Sithumini Hettiarachchi (`hettiarachchisithumini781@gmail.com`)
* **Core Domain:** Reviews and Recommendation Management.
* **Git Branch:** `origin/Reviews-and-Recommendation-Management`.
* **Backend Contributions:** Review submission and moderation endpoints.
* **Database Contributions:** Designed `reviews`, `promo_codes`, `promo_code_usages`, `promo_payments`.
* **Frontend Contributions:** Developed `ReviewsAndRecommendationsPage`, `AdminReviewsPage`, `AdminPromoPaymentsPage`.

---

# PART 22 — FINAL ASSIGNMENT GAP ANALYSIS

| Assignment Requirement | Implemented? | Existing Evidence | Missing Work / Gap | Priority |
|---|---|---|---|---|
| **ASP.NET Core Web API** | ✅ COMPLETE | `backend/Nova.Api/` (.NET 8) with 8+ controllers | None | High |
| **PostgreSQL Database** | ✅ COMPLETE | 24 tables, EF Core migrations, `DbInitializer` | None | High |
| **React Web Application** | ✅ COMPLETE | React 19, Tailwind CSS 4, 14 admin pages, tourist pages | None | High |
| **Flutter Mobile App** | 🟡 PARTIAL | `mobile/` with Home, AI Planner, Bookings screens | Token storage & login screen missing | Medium |
| **Authentication & RBAC** | ✅ COMPLETE | JWT Bearer, PBKDF2 hash, `Tourist`/`Operator`/`Admin` | Mobile client integration | High |
| **Four Business Components** | ✅ COMPLETE | Trips, Destinations, Tour Guides, Reviews/Promo | Consolidated in main branch | High |
| **Agentic AI System** | ✅ COMPLETE | 4 specialized C# agents + Python LangGraph suite | None | High |
| **Deterministic Validation** | ✅ COMPLETE | `ItineraryValidationService` (budget, time, overlap) | None | High |
| **Human-in-the-Loop Approval** | ✅ COMPLETE | `ApprovalService` (`PendingApproval` $\to$ `Approved`/`Revision`) | None | High |
| **Third-Party Integration** | ✅ COMPLETE | Google Maps Directions API + offline fallback | Production billing API key | Medium |
| **Automated Software Testing** | ✅ COMPLETE | 41 backend xUnit tests passing, 4 frontend tests | Flutter mobile tests missing | Medium |
| **AI Evaluation Evidence** | 🟡 PARTIAL | 8 golden test cases in Python; unit tests in C# | Formal quantitative LLM benchmarks | Medium |
| **Performance Testing** | ❌ MISSING | None found in repository | JMeter/k6 benchmark report needed | Medium |
| **GitHub CI/CD Pipeline** | ✅ COMPLETE | `.github/workflows/ci.yml` (.NET, Node, Flutter) | Automated cloud CD step | Low |
| **Architecture Decision Records** | ✅ COMPLETE | ADR-001 through ADR-005 documented | Include in report PDF | High |
| **Cloud Deployment** | ❌ MISSING | Runs locally; no Dockerfile or cloud PaaS configs | Dockerfile/Container config | Medium |

---

# PART 23 — FINAL REPORT CONTENT PACKAGE

### GROUP REPORT STRUCTURE

```
1. Project Overview
   1.1 Business Problem & Proposed Solution
   1.2 Objectives & Scope
   1.3 Technology Stack & Architecture Rationale
2. Requirements & User Roles
   2.1 User Roles Matrix (Tourist, Operator, Admin)
   2.2 Functional Requirements Specifications (FR-01 to FR-12)
   2.3 Non-Functional Requirements (Security, Scalability, Reliability, Usability)
3. System Architecture
   3.1 Tiered Component Architecture
   3.2 Client-Gateway-Service Communication Flow
   3.3 Integration Architecture
4. Agentic AI Architecture
   4.1 Multi-Agent Autonomous Pipeline (4 Specialized Agents)
   4.2 Deterministic Validation Engine
   4.3 Human-in-the-Loop (HITL) Governance State Machine
   4.4 Audit Logging & Observability
5. Database Design
   5.1 Relational Schema & Entity-Relationship Modeling (24 Tables)
   5.2 Indexing & Constraints
   5.3 Data Seeding & Migrations
6. API Design
   6.1 RESTful Endpoint Specifications (35+ Endpoints)
   6.2 DTOs, Serialization & Validation
   6.3 Error Handling & Middleware
7. React Web Application Design
   7.1 UI Architecture & Component Hierarchy
   7.2 Tourist Experience & Wizard Workflows
   7.3 12-Suite Administrative Management Console
8. Flutter Mobile Application Design
   8.1 Screen Flows & Navigation
   8.2 Mobile API Integration
   8.3 Hardware Sensor Evaluation
9. System Diagrams (Specifications 1 through 11)
10. Technical Implementation Details
11. Software Testing & Quality Assurance
    11.1 Backend xUnit Test Suite (41 Tests)
    11.2 Service & Integration Verification
12. Agentic AI Evaluation
    12.1 Golden Test Cases
    12.2 Rule Compliance & Boundary Recovery
13. Performance Analysis (Identified Gaps & Proposed Benchmarks)
14. Deployment Architecture (Local Kestrel/Postgres & Cloud Roadmap)
15. Architecture Decision Records (ADR-001 to ADR-005)
16. Security Analysis & Vulnerability Review
17. GitHub Workflow & CI/CD Automation
```

### INDIVIDUAL REPORTS
* **Student 1 (Hiruni Praboda):** Trip & Itinerary Management, Administrative Console, Backend .NET Migration, CI/CD.
* **Student 2 (Timali Jayasinghe):** Destination & Attraction Management, Cultural Landmark Catalog.
* **Student 3 (Nadeepa Malith):** Guide & Tour Operations, Tour Package Reservations.
* **Student 4 (Sithumini Hettiarachchi):** Reviews & Recommendation Management, Promotional Code Tracking.

### GROUP AI USAGE DECLARATION
* **Declaration:** Agentic AI tools (Google Gemini LLM, LangChain, and Antigravity IDE) were utilized for rapid architectural prototyping, generating boilerplate schema mappings, and developing automated unit test cases. All business logic, deterministic constraints, database configurations, and security policies were manually audited, verified, and grounded against SE3090 academic specifications.

---

# FINAL AUDIT SUMMARY LISTS

### A. ALREADY IMPLEMENTED
1. ASP.NET Core 8 Web API with 8+ REST controllers.
2. PostgreSQL persistence with 24 relational tables via EF Core 8.
3. JWT Bearer token authentication and Role-Based Access Control (`Tourist`, `TourismOperator`, `Admin`).
4. Autonomous 4-Agent AI Trip Generation Pipeline (`TravelPlanningAgent`, `DestinationResearchAgent`, `TravelLogisticsAgent`, `SafetyValidationAgent`).
5. Deterministic validation service enforcing budget, chronological sequence, and transit constraints.
6. Human-in-the-loop approval workflow (`PendingApproval` $\to$ `Approved`, `Rejected`, `RevisionRequested`).
7. Persistent workflow audit logging (`itinerary_generation_workflows`, `workflow_audit_logs`).
8. Multi-modal transit search with Sri Lanka Railways schedules, bus routes, and Google Maps API fallback.
9. 12-Suite Administrative Web Console in React 19 (Users, Destinations, Attractions, Activities, Transit, AI Workflows, Bookings, Payments, Reviews).
10. 41 automated xUnit backend tests covering services, agents, validation, and approval workflows.
11. 4 frontend unit tests in Node test runner.
12. Multi-tier GitHub Actions CI workflow (.NET, Node, Flutter).

### B. MISSING / NEEDS TO BE IMPLEMENTED
1. **Flutter Mobile Authentication:** Implement login screen and persistent secure token storage in mobile client.
2. **Real Payment Gateway:** Integrate actual Stripe or PayHere sandbox processing (currently records are simulated).
3. **Mobile Device Sensor Access:** Integrate native GPS geofencing and Camera QR scanner in Flutter.
4. **Performance Benchmark Suite:** Create JMeter or k6 load testing scripts.
5. **Containerization & Cloud CD:** Add Dockerfiles and automated cloud deployment manifests.

### C. NEEDS EVIDENCE / SCREENSHOTS / DOCUMENTATION
1. Screenshot of **`dotnet test` terminal output** proving 41 passed tests.
2. Screenshot of **Admin AI Workflows Page** showing agent execution logs and retry button.
3. Screenshot of **Admin Transportation Page** showing bus and train schedule management.
4. Screenshot of **Swagger UI** displaying the full ASP.NET Core endpoint catalog.
5. Screenshot of **PostgreSQL DBeaver/pgAdmin schema** showing the 24 tables.
6. Screenshot of **GitHub Actions** green pipeline run for `.github/workflows/ci.yml`.
7. Screenshot of **Flutter Mobile App** running on Android emulator.
