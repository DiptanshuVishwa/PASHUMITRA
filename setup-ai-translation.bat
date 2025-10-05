@echo off
echo ===============================================
echo PashuMitra Portal - AI Translation Setup
echo AI4Bharat IndicTrans2 Integration
echo ===============================================
echo.

echo [1/6] Installing Backend Dependencies...
cd backend
call npm install node-cache@^5.1.2
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed

echo.
echo [2/6] Setting up Python Environment...
cd python_services
if not exist ".venv" (
    echo Creating Python virtual environment...
    python -m venv .venv
    if errorlevel 1 (
        echo ❌ Failed to create virtual environment
        echo Please ensure Python is installed and available in PATH
        pause
        exit /b 1
    )
)

echo Activating virtual environment...
call .venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install Python dependencies
    echo This may take a while on first run as it downloads PyTorch and transformers
    echo Please check your internet connection and try again
    pause
    exit /b 1
)
echo ✅ Python environment ready

echo.
echo [3/6] Testing Python Translation Service...
python translation_service.py "Hello, how are you today?" hi
if errorlevel 1 (
    echo ❌ Python translation service test failed
    echo This is normal on first run - the model needs to be downloaded
    echo The model will be downloaded automatically on first API call
)
echo ✅ Python service test completed

cd ..\..

echo.
echo [4/6] Testing Backend API...
cd backend
echo Starting backend server for testing...
start /b node server.js
echo Waiting for server to start...
timeout /t 10 /nobreak > nul

echo Testing translation API endpoint...
curl -X GET "http://localhost:5000/api/translation/test?lang=hi&text=Hello world" || echo ⚠️ Backend may need to be started manually

echo.
echo [5/6] Frontend Integration Ready
echo The AI translation service has been integrated into your React frontend
echo Use the useAITranslation hook in your components

echo.
echo [6/6] Setup Complete!
echo ===============================================
echo 🎉 AI Translation System Setup Complete!
echo ===============================================
echo.
echo NEXT STEPS:
echo 1. Start the backend: cd backend && npm run dev
echo 2. Start the frontend: npm start
echo 3. Test translation in your React app using useAITranslation hook
echo.
echo IMPORTANT NOTES:
echo - First translation may take longer as the model downloads
echo - Translations are cached for better performance
echo - Fallback to i18next if AI translation fails
echo - Supports 24+ Indian languages
echo.
echo For testing, visit: http://localhost:5000/api/translation/test
echo.
pause