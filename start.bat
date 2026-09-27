@echo off
title Code Review Arena Launcher
echo ===================================================
echo           Starting Code Review Arena
echo ===================================================
echo.

:: Ensure MongoDB service is running (if installed as Windows service)
net start MongoDB >nul 2>&1

:: Launch Backend Server (Port 5000) in its own window
start "Code Review Arena - Backend Server (Port 5000)" cmd /k "cd /d %~dp0server && npm run dev"

:: Launch Frontend Client (Port 3000) in its own window
start "Code Review Arena - Frontend Client (Port 3000)" cmd /k "cd /d %~dp0client && npm run dev"

echo Waiting for services to initialize...
timeout /t 3 >nul

echo.
echo [OK] Backend API: http://localhost:5000
echo [OK] Frontend App: http://localhost:3000
echo.
echo Launching browser to http://localhost:3000...
start http://localhost:3000

echo.
echo Both servers are running. Keep the two command windows open while working!
echo Press any key to close this launcher window.
pause >nul
