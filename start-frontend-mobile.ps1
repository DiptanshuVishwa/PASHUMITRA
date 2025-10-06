# Start PashuMitra Frontend Server (Mobile Mode)
Write-Host "Starting PashuMitra Frontend Server in Mobile Mode..." -ForegroundColor Green
Write-Host "Frontend will be available at: http://10.117.158.60:3000" -ForegroundColor Yellow
Write-Host "Mobile devices can access the portal using this URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "Make sure your mobile device is connected to the same WiFi network!" -ForegroundColor Red
Write-Host ""

# Start the mobile development server
npm run start:mobile