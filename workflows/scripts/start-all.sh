#!/usr/bin/env bash
# MediConnect Elite - Unified Startup Script for Linux/macOS
echo "===================================================="
echo "🚀 Launching MediConnect Elite Full Stack"
echo "===================================================="

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Start Backend
echo "[1/2] Starting Backend Server (Port 5000)..."
(cd "$ROOT_DIR/backend" && npm run dev) &
BACKEND_PID=$!

# Start Frontend
echo "[2/2] Starting Frontend Vite Server (Port 5173)..."
(cd "$ROOT_DIR/frontend" && npm run dev -- --host) &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

wait
