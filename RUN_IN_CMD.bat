@echo off
REM SKM Questionnaire - Run in Command Prompt
REM This batch script will install, build, and start the app

echo.
echo ========================================
echo SKM Questionnaire Website - Local Setup
echo ========================================
echo.

echo Step 1: Installing dependencies...
echo (This may take 2-5 minutes)
call npm install

if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

echo.
echo Step 2: Building application...
call npm run build

if errorlevel 1 (
    echo ERROR: npm build failed
    pause
    exit /b 1
)

echo.
echo Step 3: Starting server...
echo Server will run at http://localhost:3000
echo.
echo Press CTRL+C to stop the server
call npm run start

pause
