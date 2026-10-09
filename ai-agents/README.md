# TourLink Smart Tourism Platform - Destination Research Agent

This directory contains the **Destination Research Agent**, an Agentic AI component developed for the TourLink Smart Tourism Platform.

---

## 1. Agent Role & Scope

The **Destination Research Agent** is a specialized, single-responsibility agent whose sole duty is to research factual tourism information about destinations, attractions, activities, visit durations, costs, and operating hours in Sri Lanka.

### Agent Boundaries & Narrow Scope:
- ✅ **What it DOES**: Researches destinations (e.g. Kandy, Ella, Galle, Sigiriya, Colombo), identifies attractions and categories, details visit durations, estimated costs, opening hours, and nearby sights grounded strictly in retrieved knowledge.
- ❌ **What it DOES NOT do**:
  - Does NOT calculate personalized suitability scores or rank attractions by personal preference (belongs to *Recommendation & Feedback Analysis Agent*).
  - Does NOT build multi-day itineraries or travel schedules (belongs to *Travel Planning Agent*).
  - Does NOT calculate routes, check live transit, or check weather (belongs to *Travel Logistics & Availability Agent*).
  - Does NOT process or approve bookings.

---

## 2. Lecture Alignment

- **Lecture 05: LLMs, Tools & Agent Loop**
  - Tool calling via Google Gemini (`gemini-3.5-flash-lite`, temperature=0).
  - Defined tool schema with Pydantic (`TourismSearchInput`).
  - Agent loop deciding dynamically when to invoke tools.
- **Lecture 06: RAG & Knowledge Retrieval**
  - Document modeling (`Document`), chunking (`RecursiveCharacterTextSplitter`).
  - Dense semantic embeddings (`sentence-transformers/all-MiniLM-L6-v2`).
  - Fast vector similarity search with **FAISS**.
  - Retriever wrapped as an agentic tool (`search_tourism_information`).
  - Strict grounding: no hallucinated facts.
- **Lecture 07: State, Guardrails & Bounded Execution**
  - Typed agent state with message history (`DestinationAgentState`).
  - Bounded execution guardrail (`MAX_STEPS = 5`) preventing infinite loops.
  - Safe error recovery without fabricating tourism details.
  - Pydantic output validation against `DestinationResearchResult`.

---

## 3. Architecture & Data Flow

```text
               User Research Request
                        │
                        ▼
           Destination Research Agent
          (ChatGoogleGenerativeAI + Prompt)
                        │
       Agent decides to invoke research tool
                        │
                        ▼
           search_tourism_information
                        │
                        ▼
               FAISS Vector Store
     (sentence-transformers/all-MiniLM-L6-v2)
                        │
                        ▼
             Grounded Top-K Documents
                        │
                        ▼
             Agent Observes Results
                        │
                        ▼
            Pydantic Schema Validation
                        │
                        ▼
         DestinationResearchResult (JSON)
```

---

## 4. Setup & Running

### Prerequisites
- Python 3.10+ or Anaconda Python
- Google Gemini API Key

### Step 1: Install Dependencies
```bash
cd ai-agents
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables
Create or edit `.env` in `ai-agents/.env`:
```env
GOOGLE_API_KEY=your_actual_gemini_api_key_here
```

### Step 3: Run the Demonstration Notebook
Launch Jupyter Notebook and open:
```bash
jupyter notebook notebooks/01_destination_research_agent.ipynb
```
Run all cells sequentially. The notebook walks step-by-step through all 30 progressive sections, from basic LLM tests to RAG indexing, tool wrapping, LangGraph compilation, 7 test cases, execution traces, and evaluation table.

### Step 4: Python Module Usage
```python
from agents.destination_research_agent import DestinationResearchAgent, ResearchRequest

agent = DestinationResearchAgent()

# Factual query
result = agent.run(ResearchRequest(
    destination="Kandy",
    interests=["culture", "religion"],
    requested_information="cultural attractions, estimated duration, and ticket cost"
))

print(result["result"])
```

---

## 5. Cloud Deployment on Render

The microservice is configured for immediate deployment on Render as either a **Native Python Web Service** or a **Docker Web Service**.

### Recommended Render Settings (Native Python)
| Setting | Recommended Value |
|---|---|
| **Environment** | `Python 3` |
| **Root Directory** | `ai-agents` |
| **Build Command** | `./build.sh` *(or `pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements.txt`)* |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Health Check Path** | `/health` *(both `/` and `/health` return 200 OK)* |

### Environment Variables on Render
| Variable | Value | Purpose |
|---|---|---|
| `PORT` | Auto-provided by Render (e.g., `10000` or defaults to `8000`) | Port binding |
| `PYTHONUNBUFFERED` | `1` | Stream logs immediately to Render dashboard |
| `GOOGLE_API_KEY` | *(Your Gemini API key)* | LLM reasoning & tool loop |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` | Target model |

### Using Render Blueprint (`render.yaml`)
A `render.yaml` blueprint is included in both the repository root and `ai-agents/render.yaml` for 1-click declarative deployments.

