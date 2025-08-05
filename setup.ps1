Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ValidatorAI - Local Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Step 2: Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Step 3: Environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Please edit the .env file and set your:" -ForegroundColor Yellow
    Write-Host "- DATABASE_URL (PostgreSQL connection string)" -ForegroundColor White
    Write-Host "- OPENAI_API_KEY (Your OpenAI API key)" -ForegroundColor White
    Write-Host ""
    Write-Host "You can get a free PostgreSQL database from:" -ForegroundColor Cyan
    Write-Host "- Neon: https://neon.tech" -ForegroundColor White
    Write-Host "- Supabase: https://supabase.com" -ForegroundColor White
    Write-Host ""
    Write-Host "You can get an OpenAI API key from:" -ForegroundColor Cyan
    Write-Host "- https://platform.openai.com/api-keys" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 4: Database setup..." -ForegroundColor Yellow
Write-Host "Please ensure your PostgreSQL database is running and accessible" -ForegroundColor White
Write-Host "Then run: npm run db:push" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 5: Starting development server..." -ForegroundColor Yellow
Write-Host "To start the server, run: npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "The application will be available at: http://localhost:5000" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Read-Host "Press Enter to continue" 