#!/bin/bash

# AirSense Cloud - Development Setup Script

echo "🌍 AirSense Cloud - Development Setup"
echo "======================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+"
    exit 1
fi

echo "✓ Node.js $(node -v) detected"
echo "✓ npm $(npm -v) detected"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend
npm install
cp .env.example .env
echo "✓ Backend dependencies installed"
echo "   ⚠️  Please update backend/.env with your credentials"
echo ""

# Setup Frontend
cd ../frontend
echo "📦 Setting up Frontend..."
npm install
cp .env.example .env
echo "✓ Frontend dependencies installed"
echo "   ⚠️  Please update frontend/.env with your API URL"
echo ""

cd ..

# Summary
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with MongoDB URI and API keys"
echo "2. Update frontend/.env with API URL"
echo "3. Start backend: cd backend && npm run dev"
echo "4. Start frontend: cd frontend && npm start"
echo ""
echo "📚 Documentation:"
echo "   - Setup Guide: docs/SETUP_GUIDE.md"
echo "   - API Documentation: docs/API_DOCUMENTATION.md"
echo "   - Project Structure: docs/PROJECT_STRUCTURE.md"
