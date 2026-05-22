#!/bin/bash
# Campus Cognition - Quick Test Script

echo "🚀 Campus Cognition - AI Integration Test Script"
echo "=================================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo ""
    echo "📝 Creating .env template..."
    echo "GEMINI_API_KEY=your_api_key_here" > .env
    echo "FLASK_ENV=production" >> .env
    echo "SECRET_KEY=campus-cognition-secret-key-2026" >> .env
    echo ""
    echo "✅ .env file created!"
    echo "⚠️  Please edit .env and add your Gemini API key"
    echo ""
    exit 1
fi

echo "✅ .env file found"
echo ""

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found"
    echo "📝 Creating virtual environment..."
    python -m venv .venv
    echo "✅ Virtual environment created"
    echo ""
fi

echo "🔧 Activating virtual environment..."
source .venv/Scripts/activate 2>/dev/null || source .venv/bin/activate 2>/dev/null
echo "✅ Virtual environment activated"
echo ""

echo "📦 Installing dependencies..."
pip install -q -r requirements.txt
echo "✅ Dependencies installed"
echo ""

echo "🧪 Running tests..."
echo ""

# Test 1: Import app
echo "Test 1: Checking if Flask app imports..."
python -c "import app; print('✅ Flask app imports successfully')" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ PASS: Flask app imports"
else
    echo "❌ FAIL: Flask app import error"
    exit 1
fi
echo ""

# Test 2: Check AI service
echo "Test 2: Checking AI service module..."
python -c "from services.gemini_service import is_api_available; print(f'✅ AI service available: {is_api_available()}')" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ PASS: AI service module works"
else
    echo "❌ FAIL: AI service module error"
    exit 1
fi
echo ""

# Test 3: Check database
echo "Test 3: Checking database..."
python -c "from database.models import init_db, get_db_connection; init_db(); print('✅ Database initialized')" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ PASS: Database ready"
else
    echo "❌ FAIL: Database error"
    exit 1
fi
echo ""

# Test 4: Check Gemini API
echo "Test 4: Checking Gemini API key..."
python -c "
import os
from dotenv import load_dotenv
load_dotenv()
api_key = os.getenv('GEMINI_API_KEY', '')
if api_key and api_key != 'your_api_key_here':
    print('✅ Gemini API key configured')
else:
    print('⚠️  Gemini API key not configured')
" 2>/dev/null
echo ""

# Summary
echo "=================================================="
echo "🎉 All tests completed!"
echo ""
echo "✅ You're ready to run: python app.py"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env and add your GEMINI_API_KEY"
echo "2. Run: python app.py"
echo "3. Visit: http://localhost:5000"
echo "4. Create account and test AI features"
echo ""
