@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
 echo Can cai Node.js 20 tro len: https://nodejs.org/
 pause
 exit /b 1
)
if not exist node_modules (
 call npm ci
 if errorlevel 1 (
  echo Cai thu vien that bai. Kiem tra mang va thu lai.
  pause
  exit /b 1
 )
)
start "" "http://127.0.0.1:3010"
call npm start
pause
