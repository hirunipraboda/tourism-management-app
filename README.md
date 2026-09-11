# NOVA - AI-Powered Smart Tourism Platform

NOVA is a full-stack smart tourism platform that helps tourists discover destinations, create personalized trips, generate AI-powered itineraries using a 4-agent workflow, manage bookings, and explore travel recommendations.

---

## 🛠 Technology Stack Architecture

| Layer | Required Technology | Purpose & Implementation |
| :--- | :--- | :--- |
| **Backend** | **C# + ASP.NET Core Web API (.NET 8)** | REST API, business logic, JWT authentication, Swagger/OpenAPI |
| **Data Access** | **Entity Framework Core (Npgsql)** | Relational database mapping between ASP.NET Core and PostgreSQL |
| **Database** | **PostgreSQL** | Users, destinations, attractions, tours, itineraries, bookings, audit logs |
| **Web Application** | **React 19 + TypeScript + Vite** | Tourism/operator web dashboard, approvals, management UI |
| **Mobile Application** | **Flutter + Dart** | Tourist mobile application (`mobile/`) |
| **Agentic AI** | **4-Agent Tourism Planning Orchestration** | Destination Research, Route Optimization, Validation & Orchestrator in C# |
| **Version Control** | **Git + GitHub** | Collaboration, branches, version history |
| **CI/CD** | **GitHub Actions** | Automated CI pipeline (`.github/workflows/ci.yml`) |
| **Testing** | **xUnit (.NET) + Node Test Runner** | Automated backend, agent orchestration, and frontend unit tests |

---

## 📁 Project Structure

```
NOVA/
├── .github/workflows/ci.yml        # GitHub Actions automated build & test pipeline
├── backend/                        # C# + ASP.NET Core Web API & Entity Framework Core
│   ├── Nova.sln                    # Visual Studio / .NET 8 solution
│   ├── Nova.Api/                   # ASP.NET Core Web API project
│   │   ├── Agents/                 # 4-Agent Tourism Planning Orchestration Engine
│   │   ├── Controllers/            # REST API Controllers (Auth, Trips, Bookings, AI, etc.)
│   │   ├── Data/                   # NovaDbContext (EF Core PostgreSQL Context)
│   │   ├── Models/                 # Domain Entities & Enums
│   │   ├── Program.cs              # DI, CORS, JWT Authentication & Swagger configuration
│   │   └── appsettings.json        # PostgreSQL connection string & configurations
│   └── Nova.Tests/                 # Automated xUnit Test Suite for Agents & API
├── frontend/                       # React 19 + TypeScript + Vite + TailwindCSS Web Dashboard
│   ├── src/                        # Pages, Components, State, API Services
│   └── src/tests/                  # Automated frontend tests
├── mobile/                         # Flutter + Dart Tourist Mobile Application
│   ├── lib/main.dart               # Tourist app entry point & bottom navigation
│   ├── lib/screens/                # Discovery, 4-Agent Planner, and Bookings screens
│   ├── lib/models/                 # Dart travel models
│   ├── lib/services/               # API service connecting to ASP.NET Core backend
│   └── pubspec.yaml                # Flutter dependencies & metadata
└── backend-node/                   # Archived legacy TypeScript/Express backend
```

---

## 🤖 4-Agent Tourism Planning Orchestration

The Agentic AI layer is implemented in C# under `backend/Nova.Api/Agents/` with four modular agents:
1. **`DestinationResearchAgent` (`IDestinationResearchAgent`)**: Researches destination sights, cultural highlights, and ideal seasons matching tourist styles.
2. **`RouteOptimizationAgent` (`IRouteOptimizationAgent`)**: Computes optimal destination sequences, inter-city distances, and transport recommendations.
3. **`ItineraryValidationAgent` (`IItineraryValidationAgent`)**: Evaluates budget feasibility, pacing warnings, weather advisories, and generates a feasibility score.
4. **`TripPlannerOrchestrator` (`ITripPlannerOrchestrator`)**: Coordinates the multi-agent execution pipeline, budget allocations, and day-by-day activity generation.

---

## 🚀 Running the Application

### 1. Run the C# ASP.NET Core Backend
```bash
cd backend
dotnet restore Nova.sln
dotnet run --project Nova.Api/Nova.Api.csproj
```
* **Swagger UI:** `http://localhost:5000/swagger`
* **API Base:** `http://localhost:5000/api`

### 2. Run the React Web Dashboard
```bash
cd frontend
npm install
npm run dev
```
* **Web UI:** `http://localhost:5173`

### 3. Run the Flutter Mobile Application
```bash
cd mobile
flutter pub get
flutter run
```

---

## 🧪 Running Automated Tests

### Run Backend & Agent xUnit Tests
```bash
dotnet test backend/Nova.sln
```

### Run Frontend Tests
```bash
npm test --prefix frontend
```