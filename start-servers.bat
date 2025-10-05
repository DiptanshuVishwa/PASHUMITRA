@echo off
echo ========================================
echo   PashuMitra Portal with IndicTrans2
echo ========================================
echo.
echo Starting both Frontend and Backend servers...
echo.

echo [1/3] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [2/3] Starting Backend Server (Port 5000)...
echo   - Translation API with IndicTrans2 support
echo   - REST API endpoints
echo   - MongoDB connection
echo.

start "PashuMitra Backend" cmd /k "cd /d "%~dp0backend" && echo Starting Backend Server... && npm run dev"

echo Waiting for backend to initialize...
timeout /t 3 >nul

echo [3/3] Starting Frontend Server (Port 3000)...
echo   - React application
echo   - AI Translation UI
echo   - Multilingual support
echo.

start "PashuMitra Frontend" cmd /k "cd /d "%~dp0" && echo Starting Frontend Server... && npm start"

echo.
echo ========================================
echo   Servers Starting Up!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:5000/api/docs
echo.
echo Translation Test Endpoints:
echo - Status:     GET  /api/translation/status
echo - Languages:  GET  /api/translation/languages  
echo - Translate:  POST /api/translation/translate
echo - Test:       GET  /api/translation/test?lang=hi&text=Hello
echo.
echo SERVERS WILL OPEN IN NEW WINDOWS
echo Close this window when done testing
echo.
pause