@echo off
title Halden Dental Studio - dev
cd /d "%~dp0"

rem If port 3000 is already serving, just open the running site.
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul
if not errorlevel 1 (
  echo [i] Server already running, opening http://localhost:3000
  start "" http://localhost:3000
  exit /b 0
)

rem Auto-open the browser once the dev server is up.
start "halden-open" cmd /c "timeout /t 8 /nobreak >nul & start "" http://localhost:3000"

echo [i] Starting dev server at http://localhost:3000 ... close this window to stop it.
call npm run dev
