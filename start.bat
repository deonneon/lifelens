@echo off
echo Starting backend server...
start cmd /k "cd server && python app.py"

REM Wait for backend to initialize
timeout /t 2 /nobreak > nul

echo Starting frontend...
npm run dev 