# Test PashuMitra Server Connectivity
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "    Testing PashuMitra Server Connectivity " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Test Backend
Write-Host "Testing Backend Server..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://10.117.158.60:5000/health" -Method GET -TimeoutSec 10
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "✅ Backend Server: ONLINE" -ForegroundColor Green
        Write-Host "   URL: http://10.117.158.60:5000" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Backend Server: OFFLINE or NOT RESPONDING" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# Test Frontend
Write-Host "Testing Frontend Server..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://10.117.158.60:3000" -Method GET -TimeoutSec 10
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend Server: ONLINE" -ForegroundColor Green
        Write-Host "   URL: http://10.117.158.60:3000" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Frontend Server: OFFLINE or NOT RESPONDING" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Network Information:" -ForegroundColor Yellow
Write-Host "Your WiFi IP: 10.117.158.60" -ForegroundColor White
Write-Host "Make sure your mobile device is on the same WiFi network!" -ForegroundColor White
Write-Host ""
Write-Host "Mobile Access URL: http://10.117.158.60:3000" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")