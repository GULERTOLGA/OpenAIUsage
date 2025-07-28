@echo off
echo ==================================================
echo Activating Virtual Environment
echo ==================================================

REM Check if virtual environment exists
if not exist "venv" (
    echo Virtual environment not found. Creating...
    python -m venv venv
    echo Virtual environment created successfully!
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies if needed
echo Checking dependencies...
pip install -r requirements.txt

echo ==================================================
echo Virtual environment is now active!
echo ==================================================
echo To run the Flask app: python main.py
echo To deactivate: deactivate
echo ==================================================

REM Keep the window open
cmd /k 