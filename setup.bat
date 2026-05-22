@echo off
REM Campus Cognition - Setup Script for Windows
REM This script sets up everything needed to run the application

echo.
echo ======================================
echo Campus Cognition - Setup Script
echo ======================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo [1/5] Creating virtual environment...
if not exist venv (
    python -m venv venv
    echo ^✓ Virtual environment created
) else (
    echo ^✓ Virtual environment already exists
)

echo.
echo [2/5] Activating virtual environment...
call venv\Scripts\activate.bat
echo ^✓ Virtual environment activated

echo.
echo [3/5] Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ^✓ Dependencies installed

echo.
echo [4/5] Initializing database...
python init_demo.py
echo ^✓ Database initialized with demo data

echo.
echo [5/5] Setup complete!
echo.
echo ======================================
echo Starting Campus Cognition...
echo ======================================
echo.
echo Application will open at: http://localhost:5000
echo.
echo Demo Credentials:
echo   Username: student1
echo   Password: password123
echo.

REM Start the application
python app.py

pause
