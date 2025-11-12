# PowerShell script to start both backend and frontend servers
# Run this script from the project root: .\start-dev.ps1

Write-Host "🚀 Starting HustleVillage Development Servers..." -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (-Not (Test-Path ".\.env")) {
    Write-Host "⚠️  Warning: .env file not found in backend!" -ForegroundColor Yellow
    Write-Host "Please create a .env file with your configuration." -ForegroundColor Yellow
    Write-Host "See SETUP_GUIDE.md for details." -ForegroundColor Yellow
    Write-Host ""
}

# Start Backend Server
Write-Host "📦 Starting Backend Server (Port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '🔧 Backend Server' -ForegroundColor Blue; npm run dev"

# Wait a moment for backend to initialize
Start-Sleep -Seconds 3

# Start Frontend Server
Write-Host "🎨 Starting Frontend Server (Port 8080)..." -ForegroundColor Cyan
$frontendPath = Join-Path $PWD "village-service-exchange-main\village-service-exchange-main"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '🎨 Frontend Server' -ForegroundColor Magenta; npm run dev"

Write-Host ""
Write-Host "✅ Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Server Information:" -ForegroundColor White
Write-Host "   Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "To stop servers: Close the PowerShell windows or press Ctrl+C in each" -ForegroundColor Yellow

