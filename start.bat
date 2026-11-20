@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
 echo Can cai Node.js 22 LTS: https://nodejs.org/
 pause
 exit /b 1
)
set OPEN_BROWSER=1
call npm start
if errorlevel 1 echo Khoi dong that bai. Xem thong bao ben tren; giu cua so nay de kiem tra.
pause
