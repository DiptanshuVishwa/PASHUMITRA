# Start PashuMitra Backend Server
Write-Host "Starting PashuMitra Backend Server..." -ForegroundColor Green
Write-Host "Backend will be available at: http://10.117.158.60:5000" -ForegroundColor Yellow

# Change to backend directory
Set-Location ".\backend"

# Start the development server
npm run dev