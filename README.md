# TourLink - AI-Powered Smart Tourism Platform

TourLink is a full-stack smart tourism platform that helps tourists discover destinations, create personalized trips, generate AI-powered itineraries using a four-agent workflow, manage bookings, and explore travel recommendations.

The platform integrates a React web application, a Flutter mobile application, an ASP.NET Core REST API, PostgreSQL, and an Agentic AI subsystem to deliver an integrated tourism planning experience.

---

## 🌐 Live Deployment

The following components are deployed and accessible online.

| Component | Description | Deployment URL |
|---|---|---|
| **Frontend Web Application** | React-based tourism platform and dashboard | `https://tourism-planner-frontend.onrender.com` |
| **Backend API** | ASP.NET Core REST API | `https://tourism-planner-api.onrender.com` |
| **Swagger API Documentation** | Interactive API documentation and endpoint testing | `https://tourism-planner-api.onrender.com/swagger` |
| **Backend Health Check** | Checks whether the backend API is running | `https://tourism-planner-api.onrender.com/health` |
| **Agentic AI Service** | Four-agent tourism planning subsystem | `https://nova-agentic-ai-f4im.onrender.com` |
| **PostgreSQL Database** | Supabase PostgreSQL | Hosted on Supabase; credentials and connection details are kept private |
| **Flutter Mobile Application** | Android mobile application | See the APK installation instructions below |


---

## ✨ Key Features

- Destination discovery and travel recommendations.
- Personalized trip creation and management.
- AI-powered itinerary generation using a four-agent workflow.
- Route optimization and transport recommendations.
- Budget feasibility analysis and itinerary validation.
- Booking management.
- User authentication and role-based access.
- Web-based management and approval interfaces.
- Flutter mobile application for tourists.
- REST API integration with PostgreSQL.
- Automated testing and continuous integration using GitHub Actions.

---

## 🛠 Technology Stack Architecture

| Layer | Technology | Purpose |
|---|---|---|
| Backend | C# + ASP.NET Core Web API (.NET 8) | REST APIs, business logic, JWT authentication and Swagger |
| Data Access | Entity Framework Core + Npgsql | Relational database access |
| Database | PostgreSQL | Users, destinations, attractions, trips, itineraries, bookings and audit logs |
| Web Application | React 19 + TypeScript + Vite | Tourism interface, management dashboard and approvals |
| Mobile Application | Flutter + Dart | Tourist mobile application |
| Agentic AI | Four-agent tourism planning orchestration | Destination research, route optimization, validation and orchestration |
| Version Control | Git + GitHub | Source control and collaboration |
| CI/CD | GitHub Actions | Automated build and test pipeline |
| Testing | xUnit + Node.js test runner | Backend, agent orchestration and frontend testing |

---

## 📁 Project Structure

```text
NOVA/
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
│   ├── Nova.sln
│   ├── Nova.Api/
│   │   ├── Agents/
│   │   ├── Controllers/
│   │   ├── Data/
│   │   ├── Models/
│   │   ├── Program.cs
│   │   └── appsettings.json
│   └── Nova.Tests/
├── frontend/
│   └── src/
│       └── tests/
├── mobile/
│   ├── lib/
│   │   ├── main.dart
│   │   ├── screens/
│   │   ├── models/
│   │   └── services/
│   └── pubspec.yaml
└── backend-node/
    └── Archived legacy backend
```

---

## 🤖 Four-Agent Tourism Planning Orchestration

The Agentic AI layer is implemented in C# under `backend/Nova.Api/Agents/`.

1. **Destination Research Agent (`IDestinationResearchAgent`)**  
   Researches destination attractions, cultural highlights, and suitable travel seasons based on tourist preferences.

2. **Route Optimization Agent (`IRouteOptimizationAgent`)**  
   Determines suitable destination sequences, inter-city distances, and transport recommendations.

3. **Itinerary Validation Agent (`IItineraryValidationAgent`)**  
   Evaluates budget feasibility, travel pacing, weather advisories, and itinerary feasibility.

4. **Trip Planner Orchestrator (`ITripPlannerOrchestrator`)**  
   Coordinates the agents, manages the planning workflow, allocates budgets, and generates day-by-day itinerary activities.

### Agentic AI Workflow

The orchestration process coordinates destination research, route optimization, itinerary generation, and validation to produce a personalized travel plan.

The AI subsystem is integrated with the application backend so that the web and mobile clients can access AI-powered functionality through the appropriate backend APIs.

---
## 🗄️ Database — Supabase PostgreSQL

NOVA uses PostgreSQL hosted on Supabase as its primary relational database.

The ASP.NET Core Web API connects to the database using Entity Framework Core and the Npgsql PostgreSQL provider.

### Database Responsibilities

The database stores application information, including:

- User accounts and related information.

- Destinations and tourist attractions.

- Trips and itinerary activities.

- Bookings and related records.

- Other application data required by the platform.

### Database Configuration

- Access the NOVA project in the Supabase Dashboard.

- Obtain the PostgreSQL connection details from the project's database connection settings.

- Configure the database connection string in the backend's environment variables or local development configuration.

- Apply the required Entity Framework Core migrations when initializing or updating the database schema.

- Run the backend and verify that it can connect to the Supabase PostgreSQL database.

### Database Security

- Keep database credentials and connection strings private.

- Never commit production credentials to GitHub.

- Use environment variables or hosting-provider secrets to configure database access.

- Restrict database access according to the application's security requirements.

- **Database provider:** Supabase PostgreSQL
- **ORM:** Entity Framework Core
- **PostgreSQL provider:** Npgsql

---
## 🚀 Running the Application Locally

### Prerequisites

Install the following tools before running the project:

- .NET 8 SDK
- Node.js and npm
- Flutter SDK and Dart
- PostgreSQL, or access to a hosted PostgreSQL database
- Git

### 1. Run the ASP.NET Core Backend

```bash
cd backend
dotnet restore Nova.sln
dotnet run --project Nova.Api/Nova.Api.csproj
```

The actual local API and Swagger URLs depend on the configured ASP.NET Core launch settings.

- **Swagger UI:** Use the Swagger URL displayed by the application.
- **API Base URL:** Use the configured local API address.

### 2. Run the React Web Application

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, typically:

`http://localhost:5173`

Ensure the frontend API configuration points to the backend URL you are using.

### 3. Run the Flutter Mobile Application

```bash
cd mobile
flutter pub get
flutter run
```

Configure the mobile application's API base URL for the target device or emulator.

### 4. Configure the Agentic AI Subsystem

Ensure the Agentic AI subsystem is available and its required configuration is set before using AI-powered trip planning.

For a separately deployed AI service:

- Configure the AI service URL in the backend environment.
- Ensure the ASP.NET Core backend can reach the deployed AI service.
- Keep model credentials and API keys in environment variables or the hosting provider's secret configuration.
- Verify that the AI workflow completes successfully.

If the agents run inside the ASP.NET Core application, no separate AI service URL is required.

---

## 🔐 Environment Configuration

Configure environment variables and application settings for your deployment.

Typical configuration values may include:

```env
# Backend
ConnectionStrings__DefaultConnection=postgresql://postgres:[YOUR-PASSWORD]@db.acdounmnuabhqxfmjjhm.supabase.co:5432/postgres
Jwt__Key=YOUR_JWT_SECRET

# AI service 
AgenticAI__BaseUrl=https://nova-agentic-ai-f4im.onrender.com

# Frontend
VITE_API_BASE_URL=https://tourism-planner-frontend.onrender.com
```


---

## 🧪 Running Automated Tests

### Backend and Agent Tests

```bash
dotnet test backend/Nova.sln
```

### Frontend Tests

```bash
npm test --prefix frontend
```

Run tests from the relevant project directories if your test scripts or solution structure require different commands.

---

## ☁️ Deployment Architecture

The deployed system consists of the following components:

1. **React Frontend:** Serves the web interface to users.
2. **ASP.NET Core Backend:** Handles authentication, authorization, business logic, database operations and API requests.
3. **PostgreSQL Database:** Persists application data.
4. **Agentic AI Subsystem:** Generates and validates tourism itineraries through the four-agent workflow.
5. **Flutter Mobile Application:** Provides mobile access to tourism features through the backend API.

The React and Flutter applications should communicate with the same ASP.NET Core API, which accesses PostgreSQL and integrates the Agentic AI subsystem.

---

## 📱 Flutter APK Installation

To build a release APK, run:

```bash
cd mobile
flutter build apk --release
```

The generated APK is typically located at:

```text
mobile/build/app/outputs/flutter-apk/app-release.apk
```


---


---

## 🔒 Security Considerations

- JWT-based authentication and role-based authorization.
- Server-side validation of API requests.
- Secure storage of application secrets.
- Protected database connections.
- Controlled AI tool access and validation of AI-generated outputs.
- Appropriate error handling and logging.



---

## 🤖 AI Usage Declaration

AI tools were used during development where applicable. All AI-assisted code, documentation, tests, and designs must be reviewed, tested, and understood by the project team.

---

## 📄 License and Acknowledgements

Add the project license, third-party API acknowledgements, external libraries, and other resources used by the project where applicable.
