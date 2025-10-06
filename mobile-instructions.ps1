# PashuMitra Mobile Access Instructions
Clear-Host
Write-Host ""
Write-Host "📱 " -NoNewline -ForegroundColor Yellow
Write-Host "PashuMitra Portal - Mobile Access Guide" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""

Write-Host "🌐 Your Portal URLs:" -ForegroundColor Cyan
Write-Host "   Frontend (Mobile): http://10.117.158.60:3000" -ForegroundColor White
Write-Host "   Backend API:       http://10.117.158.60:5000" -ForegroundColor White
Write-Host ""

Write-Host "📋 Step-by-Step Mobile Setup:" -ForegroundColor Yellow
Write-Host "   1️⃣  Connect your mobile device to the SAME WiFi network as this computer" -ForegroundColor White
Write-Host "   2️⃣  Open any browser on your mobile (Chrome, Safari, Firefox, etc.)" -ForegroundColor White
Write-Host "   3️⃣  Type this URL in the browser: " -NoNewline -ForegroundColor White
Write-Host "http://10.117.158.60:3000" -ForegroundColor Green
Write-Host "   4️⃣  Your PashuMitra portal should load on mobile!" -ForegroundColor White
Write-Host ""

Write-Host "🔧 Available PowerShell Scripts:" -ForegroundColor Magenta
Write-Host "   • start-both-servers.ps1     - Start both frontend & backend" -ForegroundColor Gray
Write-Host "   • start-backend.ps1          - Start backend only" -ForegroundColor Gray
Write-Host "   • start-frontend-mobile.ps1  - Start frontend in mobile mode" -ForegroundColor Gray
Write-Host "   • test-connectivity.ps1      - Test if servers are running" -ForegroundColor Gray
Write-Host "   • mobile-instructions.ps1    - Show this help (current script)" -ForegroundColor Gray
Write-Host ""

Write-Host "🚨 Troubleshooting:" -ForegroundColor Red
Write-Host "   • Make sure Windows Firewall allows connections on ports 3000 & 5000" -ForegroundColor White
Write-Host "   • Ensure both devices are on the same WiFi network" -ForegroundColor White
Write-Host "   • Try disabling VPN if you're using one" -ForegroundColor White
Write-Host "   • Some corporate/guest networks block device-to-device communication" -ForegroundColor White
Write-Host ""

Write-Host "💡 Quick Test:" -ForegroundColor Yellow
Write-Host "   Run: " -NoNewline -ForegroundColor White
Write-Host ".\test-connectivity.ps1" -ForegroundColor Green
Write-Host "   to check if both servers are running properly" -ForegroundColor White
Write-Host ""

Write-Host "======================================================" -ForegroundColor Green
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")