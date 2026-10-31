# MediConnect Elite - Unified Startup Script for Windows PowerShell
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "🚀 Launching MediConnect Elite Full Stack" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$root = Resolve-Path "$PSScriptRoot\..\.."
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"

# 1. Start Backend in new process
Write-Host "[1/2] Starting Backend Server (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; npm run dev"

# 2. Start Frontend in new process
Write-Host "[2/2] Starting Frontend Vite Server (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev -- --host"

Start-Sleep -Seconds 4
Write-Host "`n✅ Both servers have been launched in separate windows!" -ForegroundColor Green
Write-Host "👉 Frontend: http://localhost:5173/" -ForegroundColor White
Write-Host "👉 Backend:  http://localhost:5000/api/health" -ForegroundColor White
