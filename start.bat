@echo off
echo Starting OpenAI Usage API with React Frontend...

echo.
echo Step 1: Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Step 2: Installing Node.js dependencies...
npm install

echo.
echo Step 3: Building React frontend...
npm run build

echo.
echo Step 4: Starting Flask API server...
echo The application will be available at: http://localhost:5000
echo.
python main.py 