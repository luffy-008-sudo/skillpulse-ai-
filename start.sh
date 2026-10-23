#!/bin/bash
# SkillPulse AI - Quick Start Script

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Starting SkillPulse AI..."
echo ""

# Start backend
echo "📦 Starting backend (FastAPI on :8000)..."
cd "$ROOT_DIR/backend"
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/skillpulse_backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend
sleep 4
if curl -s http://127.0.0.1:8000/api/health > /dev/null; then
    echo "   ✅ Backend healthy"
else
    echo "   ⚠️ Backend may still be starting..."
fi

# Start frontend
echo ""
echo "🌐 Starting frontend (Next.js on :3000)..."
cd "$ROOT_DIR/frontend"
npx next dev -p 3000 -H 0.0.0.0 > /tmp/skillpulse_frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ SkillPulse AI is starting up!"
echo ""
echo "   Frontend (Dashboard): http://localhost:3000 or http://192.168.0.8:3000"
echo "   Backend (API Docs):   http://localhost:8000/docs or http://192.168.0.8:8000/docs"
echo "   Backend logs:         tail -f /tmp/skillpulse_backend.log"
echo "   Frontend logs:        tail -f /tmp/skillpulse_frontend.log"
echo ""
echo "   Press Ctrl+C to stop all services"

# Wait
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
