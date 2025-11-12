# HustleVillage Development Startup Script
Write-Host "🚀 Starting HustleVillage Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Check if .env files exist, if not copy from examples
if (-not (Test-Path ".\backend\.env")) {
    Write-Host "📝 Creating backend .env file..." -ForegroundColor Yellow
    Copy-Item ".\backend\.env.example" ".\backend\.env"
}

if (-not (Test-Path ".\frontend\.env")) {
    Write-Host "📝 Creating frontend .env file..." -ForegroundColor Yellow
    Copy-Item ".\frontend\.env.example" ".\frontend\.env"
}

Write-Host ""
Write-Host "✅ Environment files ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Starting servers..." -ForegroundColor Cyan
Write-Host "  - Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "  - Backend API: http://localhost:3000" -ForegroundColor Green
Write-Host ""

# Start backend in a new window
$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm start" -PassThru

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Start frontend in a new window
$frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -PassThru

Write-Host ""
Write-Host "✅ Both servers started!" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop this script (servers will continue running in separate windows)" -ForegroundColor Yellow
Write-Host ""

# Keep script running
while ($true) {
    Start-Sleep -Seconds 1
}

