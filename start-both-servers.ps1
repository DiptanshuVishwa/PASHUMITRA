# Start Both PashuMitra Servers
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "    Starting PashuMitra Portal Servers     " -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

# Function to start backend in new window
function Start-Backend {
    Write-Host "Starting Backend Server..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; .\start-backend.ps1"
}

# Function to start frontend in new window
function Start-Frontend {
    Write-Host "Starting Frontend Server..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; .\start-frontend-mobile.ps1"
}

Write-Host "Opening Backend Server in new window..." -ForegroundColor Yellow
Start-Backend

Write-Host "Waiting 5 seconds for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Opening Frontend Server in new window..." -ForegroundColor Yellow
Start-Frontend

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "    Servers Started Successfully!          " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://10.117.158.60:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://10.117.158.60:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Mobile Access Instructions:" -ForegroundColor Yellow
Write-Host "1. Connect your mobile to the same WiFi network" -ForegroundColor White
Write-Host "2. Open mobile browser and go to: http://10.117.158.60:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")