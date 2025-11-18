# Development start script for Windows PowerShell
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/parlay_party?schema=public"
$env:NODE_ENV = "development"
$env:PORT = "8080"
$env:REDIS_URL = "redis://localhost:6379"
$env:SERVER_SALT = "dev-salt-for-testing"

Write-Host "Starting server with development environment..." -ForegroundColor Green
Write-Host "DATABASE_URL: $env:DATABASE_URL"
Write-Host "NODE_ENV: $env:NODE_ENV"
Write-Host "PORT: $env:PORT"

# Run the development server
pnpm dev
