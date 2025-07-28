# PowerShell script to activate virtual environment

Write-Host "==================================================" -ForegroundColor Green
Write-Host "Activating Virtual Environment" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "Virtual environment not found. Creating..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "Virtual environment created successfully!" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Install dependencies if needed
Write-Host "Checking dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

Write-Host "==================================================" -ForegroundColor Green
Write-Host "Virtual environment is now active!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "To run the Flask app: python main.py" -ForegroundColor Cyan
Write-Host "To deactivate: deactivate" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Green 