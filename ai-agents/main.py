"""
NOVA Agentic AI API - Primary Cloud Entry Point
==============================================
Exposes the FastAPI application and multi-agent system endpoints.
Ensures reliable startup on Render, Docker, and local development.
Supports both `uvicorn main:app` and `uvicorn server:app`.
"""

import os
import sys

# Ensure current directory is on sys.path regardless of execution working directory
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from server import app

# Export app instance for ASGI servers
__all__ = ["app"]


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"Starting NOVA Agentic AI service on {host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=False)
