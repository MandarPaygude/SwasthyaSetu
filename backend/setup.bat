@echo off
REM Setup script for Windows

echo ============================================
echo Sevadham App - Backend Setup
echo ============================================

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

echo.
echo ============================================
echo Setup completed!
echo ============================================
echo.
echo To start the backend server, run:
echo   venv\Scripts\activate
echo   python -m uvicorn app.main:app --reload
echo.
echo To expose with ngrok in another terminal:
echo   ngrok http 8000
echo.
