@echo off
REM AirSense Cloud - Development Setup Script

echo.
echo 🌍 AirSense Cloud - Development Setup
echo =====================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 14+
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION% detected
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✓ npm %NPM_VERSION% detected
echo.

REM Setup Backend
echo 📦 Setting up Backend...
cd backend
call npm install
copy .env.example .env
echo ✓ Backend dependencies installed
echo    ⚠️  Please update backend\.env with your credentials
echo.

REM Setup Frontend
cd ..\frontend
echo 📦 Setting up Frontend...
call npm install
copy .env.example .env
echo ✓ Frontend dependencies installed
echo    ⚠️  Please update frontend\.env with your API URL
echo.

cd ..

REM Summary
echo.
echo ✅ Setup Complete!
echo.
echo Next steps:
echo 1. Update backend\.env with MongoDB URI and API keys
echo 2. Update frontend\.env with API URL
echo 3. Start backend: cd backend ^&^& npm run dev
echo 4. Start frontend: cd frontend ^&^& npm start
echo.
echo 📚 Documentation:
echo    - Setup Guide: docs\SETUP_GUIDE.md
echo    - API Documentation: docs\API_DOCUMENTATION.md
echo    - Project Structure: docs\PROJECT_STRUCTURE.md
