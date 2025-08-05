@echo off
echo ========================================
echo ValidatorAI - Local Setup Script
echo ========================================
echo.

echo Step 1: Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed

echo.
echo Step 2: Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo Step 3: Environment configuration...
if not exist ".env" (
    echo Creating .env file from template...
    copy "env.example" ".env"
    echo ✓ .env file created
    echo.
    echo IMPORTANT: Please edit the .env file and set your:
    echo - DATABASE_URL (PostgreSQL connection string)
    echo - OPENAI_API_KEY (Your OpenAI API key)
    echo.
    echo You can get a free PostgreSQL database from:
    echo - Neon: https://neon.tech
    echo - Supabase: https://supabase.com
    echo.
    echo You can get an OpenAI API key from:
    echo - https://platform.openai.com/api-keys
    echo.
) else (
    echo ✓ .env file already exists
)

echo.
echo Step 4: Database setup...
echo Please ensure your PostgreSQL database is running and accessible
echo Then run: npm run db:push
echo.

echo Step 5: Starting development server...
echo To start the server, run: npm run dev
echo.
echo The application will be available at: http://localhost:5000
echo.
echo ========================================
echo Setup complete! 
echo ========================================
pause 