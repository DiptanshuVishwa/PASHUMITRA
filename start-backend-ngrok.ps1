# PashuMitra Backend Server with Ngrok Tunnel
Write-Host "Starting PashuMitra Backend Server with Ngrok Tunnel..." -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Set location to backend directory
Set-Location "C:\Users\KIIT0001\Desktop\PashuMitra +translator\backend"

# Start backend server in background
Write-Host "Starting Node.js backend server on port 5000..." -ForegroundColor Yellow
Start-Job -Name "BackendServer" -ScriptBlock {
    Set-Location "C:\Users\KIIT0001\Desktop\PashuMitra +translator\backend"
    npm start
}

# Wait a moment for server to start
Start-Sleep -Seconds 5

# Start ngrok tunnel for backend
Write-Host "Creating ngrok tunnel for backend (port 5000)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend ngrok tunnel will be available in a moment..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop both server and tunnel" -ForegroundColor Red
Write-Host ""

# Start ngrok tunnel
&"C:\Users\KIIT0001\AppData\Local\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe" http 5000

# Cleanup when script ends
Stop-Job -Name "BackendServer" -ErrorAction SilentlyContinue
Remove-Job -Name "BackendServer" -ErrorAction SilentlyContinue
Write-Host "Backend server and ngrok tunnel stopped." -ForegroundColor Red