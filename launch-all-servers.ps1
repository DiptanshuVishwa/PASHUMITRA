# PashuMitra Portal - Launch All Servers with Ngrok Tunnels
Write-Host "=" * 60 -ForegroundColor Magenta
Write-Host "    PashuMitra Portal - Starting All Servers with Ngrok" -ForegroundColor Magenta
Write-Host "=" * 60 -ForegroundColor Magenta
Write-Host ""

$projectPath = "C:\Users\KIIT0001\Desktop\PashuMitra +translator"

Write-Host "🚀 Starting Backend Server (Node.js + Ngrok)..." -ForegroundColor Green
Write-Host "   This will open in a new PowerShell window" -ForegroundColor Gray
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass", "-File `"$projectPath\start-backend-ngrok.ps1`"", "-NoExit"

Write-Host ""
Write-Host "⏱️  Waiting 8 seconds before starting frontend..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

Write-Host "🎨 Starting Frontend Server (React + Ngrok)..." -ForegroundColor Green
Write-Host "   This will open in a new PowerShell window" -ForegroundColor Gray
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass", "-File `"$projectPath\start-frontend-ngrok.ps1`"", "-NoExit"

Write-Host ""
Write-Host "✅ Both servers are starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host "   1. Wait for both PowerShell windows to show ngrok URLs" -ForegroundColor White
Write-Host "   2. The backend ngrok URL will look like: https://xxxx-xx-xx-xx-xx.ngrok-free.app" -ForegroundColor White
Write-Host "   3. The frontend ngrok URL will look like: https://yyyy-yy-yy-yy-yy.ngrok-free.app" -ForegroundColor White
Write-Host "   4. Use the frontend URL to access your portal from mobile/desktop" -ForegroundColor White
Write-Host ""
Write-Host "🔧 CONFIGURATION:" -ForegroundColor Yellow
Write-Host "   - Backend will run on port 5000 (tunneled via ngrok)" -ForegroundColor White
Write-Host "   - Frontend will run on port 3000 (tunneled via ngrok)" -ForegroundColor White
Write-Host "   - Both servers will be accessible from anywhere via ngrok URLs" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT:" -ForegroundColor Red
Write-Host "   - Keep both PowerShell windows open while using the app" -ForegroundColor White
Write-Host "   - Press Ctrl+C in either window to stop that server" -ForegroundColor White
Write-Host "   - Ngrok free tier has session limits - restart if tunnel expires" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")