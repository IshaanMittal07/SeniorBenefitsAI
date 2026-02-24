#!/bin/bash

# Senior Benefits App - Setup Script
# This script initializes the development environment

set -e

echo "🚀 Senior Benefits Application Setup"
echo "======================================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✓ npm $(npm -v)"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed or not in PATH"
    echo "   Install from https://www.postgresql.org/download/"
    echo "   Or use Docker: docker run -e POSTGRES_PASSWORD=password -e POSTGRES_DB=seniors_db -p 5432:5432 -d postgres:14"
fi

# Create .env files
echo ""
echo "📝 Setting up environment files..."

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✓ Created backend/.env"
    echo "  ⚠️  Update with your actual values (database URL, API keys, etc.)"
else
    echo "✓ backend/.env already exists"
fi

if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo "✓ Created frontend/.env"
else
    echo "✓ frontend/.env already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm run install-all

# Database setup guidance
echo ""
echo "📊 Database Setup"
echo "================="
echo "Before running migrations, ensure PostgreSQL is running:"
echo "  - Local: psql -U postgres"
echo "  - Docker: docker exec -it seniors-db psql -U postgres"
echo ""
echo "To complete setup:"
echo "  1. Update DATABASE_URL in backend/.env"
echo "  2. Update OPENAI_API_KEY in backend/.env"
echo "  3. Run: npm run db:migrate"
echo "  4. Run: npm run db:seed"

# Success message
echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "  1. Update environment variables in backend/.env and frontend/.env"
echo "  2. Set up PostgreSQL database and update DATABASE_URL"
echo "  3. Run database migrations: npm run db:migrate"
echo "  4. Seed database: npm run db:seed"
echo "  5. Start development: npm run dev"
echo ""
echo "📚 For more details, see:"
echo "  - QUICKSTART.md - 5-minute quick start"
echo "  - DEVELOPMENT.md - Complete development guide"
echo "  - API.md - API documentation"
echo ""
