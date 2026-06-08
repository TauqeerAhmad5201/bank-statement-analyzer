#!/bin/bash
# Start backend
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Start frontend
cd ../frontend-app
npm run dev &
FRONTEND_PID=$!

echo "Both servers are running..."
echo "Backend is at http://localhost:8000"
echo "Frontend is at http://localhost:5173"
echo "Press Ctrl+C to stop both."

wait
