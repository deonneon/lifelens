#!/bin/bash

# Start the Python backend server in a new terminal
echo "Starting backend server..."
cd server && python app.py &
BACKEND_PID=$!

# Wait for backend to initialize
sleep 2

# Start the frontend development server
echo "Starting frontend..."
npm run dev

# When frontend is terminated, stop the backend
echo "Stopping backend server..."
kill $BACKEND_PID 