# PashuMitra Frontend Server with Ngrok Tunnel
Write-Host "Starting PashuMitra Frontend Server with Ngrok Tunnel..." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Set location to project root directory
Set-Location "C:\Users\KIIT0001\Desktop\PashuMitra +translator"

# Start React frontend server in background
Write-Host "Starting React frontend server on port 3000..." -ForegroundColor Yellow
Start-Job -Name "FrontendServer" -ScriptBlock {
    Set-Location "C:\Users\KIIT0001\Desktop\PashuMitra +translator"
    $env:HOST = "0.0.0.0"  # Allow access from any IP
    npm start
}

# Wait a moment for server to start
Start-Sleep -Seconds 10

# Start ngrok tunnel for frontend
Write-Host "Creating ngrok tunnel for frontend (port 3000)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Frontend ngrok tunnel will be available in a moment..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop both server and tunnel" -ForegroundColor Red
Write-Host ""

# Start ngrok tunnel
&"C:\Users\KIIT0001\AppData\Local\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe" http 3000

# Cleanup when script ends
Stop-Job -Name "FrontendServer" -ErrorAction SilentlyContinue
Remove-Job -Name "FrontendServer" -ErrorAction SilentlyContinue
Write-Host "Frontend server and ngrok tunnel stopped." -ForegroundColor Red