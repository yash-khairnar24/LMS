@echo off
echo Starting LMS Application...
echo.

echo [1/2] Starting Backend Server (port 5000)...
start "LMS Backend" cmd /k "cd /d C:\Users\Lenovo\Desktop\LMS\backend && npm run dev"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Frontend Dev Server (port 5173)...
start "LMS Frontend" cmd /k "cd /d C:\Users\Lenovo\Desktop\LMS\frontend && npm run dev"

echo.
echo Both servers are starting...
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:5173
echo.
pause
