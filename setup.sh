#!/bin/bash

# Campus Cognition - Setup Script for macOS/Linux
# This script sets up everything needed to run the application

echo ""
echo "======================================"
echo "Campus Cognition - Setup Script"
echo "======================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python from https://www.python.org/"
    exit 1
fi

echo "[1/5] Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi

echo ""
echo "[2/5] Activating virtual environment..."
source venv/bin/activate
echo "✓ Virtual environment activated"

echo ""
echo "[3/5] Installing dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi
echo "✓ Dependencies installed"

echo ""
echo "[4/5] Initializing database..."
python init_demo.py
echo "✓ Database initialized with demo data"

echo ""
echo "[5/5] Setup complete!"
echo ""
echo "======================================"
echo "Starting Campus Cognition..."
echo "======================================"
echo ""
echo "Application will open at: http://localhost:5000"
echo ""
echo "Demo Credentials:"
echo "  Username: student1"
echo "  Password: password123"
echo ""

# Start the application
python app.py
