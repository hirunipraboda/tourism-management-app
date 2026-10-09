#!/usr/bin/env bash
# ==============================================================================
# Render Build Script for NOVA / TourLink Agentic AI Microservice
# ==============================================================================
set -e

echo "=== [1/3] Installing Lightweight PyTorch CPU Wheel ==="
pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

echo "=== [2/3] Installing AI Microservice Dependencies ==="
pip install --no-cache-dir -r requirements.txt

echo "=== [3/3] Pre-caching Sentence Transformers Model ==="
python -c "from langchain_huggingface import HuggingFaceEmbeddings; HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')" || echo "Warning: Model pre-caching skipped; will load at runtime."

echo "=== NOVA AI Microservice Build Completed Successfully ==="
