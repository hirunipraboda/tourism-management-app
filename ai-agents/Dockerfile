# Production Dockerfile for NOVA AI Agents Microservice
FROM python:3.11-slim

WORKDIR /app

# Install minimal build tools for compiling native extensions (faiss, sentence-transformers)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code, agents, tools, and local datasets
COPY . .

# Expose default HTTP port
EXPOSE 8000

ENV PORT=8000
ENV PYTHONUNBUFFERED=1

# Start FastAPI server on 0.0.0.0 using dynamic Render PORT
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}"]
