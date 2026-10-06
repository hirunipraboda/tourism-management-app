"""
NOVA Agentic AI API - entry point.

The FastAPI app and all agent endpoints live in server.py. This module
re-exports it so both `uvicorn main:app` and `uvicorn server:app` work.
"""

from server import app


@app.get("/")
def root():
    return {"status": "Agentic AI service running"}


if __name__ == "__main__":
    import os
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
