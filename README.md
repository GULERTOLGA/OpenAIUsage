# OpenAI Usage API - Flask Application

This Flask application provides a REST API for accessing the OpenAI usage API.

## Features

### Backend (Flask API)
- View OpenAI usage data
- Get subscription information
- View billing usage
- Get cost data
- Get projects list
- Get usage summary
- Error handling and logging
- API key validation

### Frontend (React TypeScript)
- Modern and responsive Bootstrap UI
- Type safety with TypeScript
- Dynamic user interface with React
- Navigation menu and page routing
- Projects page with DataTable-like table
- Search and pagination features
- Ready structure for API integration

## Installation

### Backend (Flask API)

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment file:

**Windows:**
```bash
setup_env.bat
```

**Linux/Mac:**
```bash
chmod +x setup_env.sh
./setup_env.sh
```

3. Configure your OpenAI API key:

**Option 1: Using .env file (Recommended)**
```bash
# Copy env.example to .env
cp env.example .env

# Edit .env file and add your API key
# Windows
notepad .env

# Linux/Mac
nano .env
```

**Option 2: As environment variable**
```bash
# Windows PowerShell
$env:OPENAI_API_KEY="your-api-key-here"

# Windows Command Prompt
set OPENAI_API_KEY=your-api-key-here

# Linux/Mac
export OPENAI_API_KEY="your-api-key-here"
```

3. Optionally configure OpenAI Organization ID:
```bash
$env:OPENAI_ORG_ID="your-org-id-here"
```

### Frontend (React TypeScript)

1. Install Node.js dependencies:
```bash
npm install
```

2. Run in development mode:
```bash
npm start
```

## Running

### Quick Start (Full Application)

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

### Manual Running

1. Start the backend:
```bash
python main.py
```

2. Build and run the frontend:
```bash
npm install
npm run build
```

The application will run at `http://localhost:5000` by default.

## API Endpoints

### 1. Health Check
```
GET /health
```
Checks the status of the API.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00",
  "api_key_configured": true
}
```

### 2. Usage Data
```
GET /usage?date=2024-01-01
GET /usage?start_date=2024-01-01&end_date=2024-01-31
```
Gets OpenAI usage data.

**Query Parameters:**
- `date`: Specific date (in YYYY-MM-DD format)
- `start_date`: Start date
- `end_date`: End date

### 3. Subscription Information
```
GET /subscription
```
Gets OpenAI subscription information.

### 4. Billing Usage
```
GET /billing?start_date=2024-01-01&end_date=2024-01-31
```
Gets billing usage data.

**Query Parameters:**
- `start_date`: Start date (default: first day of month)
- `end_date`: End date (default: today)

### 5. Costs Data
```
GET /costs?start_time=1704067200&end_time=1706745600&bucket_width=1d&limit=7
```
Gets OpenAI cost data.

**Query Parameters:**
- `start_time`: Start time (Unix seconds) - **Required**
- `end_time`: End time (Unix seconds) - Optional
- `bucket_width`: Time bucket width (default: "1d")
- `group_by`: Grouping fields (project_id, line_item)
- `limit`: Number of buckets to return (1-180, default: 7)
- `page`: Cursor for pagination
- `project_ids`: Cost data for specific projects

### 6. Projects List
```
GET /projects?after=proj_abc&limit=20&include_archived=false
```
Gets the list of OpenAI projects.

**Query Parameters:**
- `after`: Cursor for pagination (object ID)
- `include_archived`: Include archived projects (default: false)
- `limit`: Number of projects to return (1-100, default: 20)

### 7. Usage Summary
```
GET /summary
```
Gets a summary of subscription, billing, and cost information.

## Example Usage

### API calls with cURL:

```bash
# Health check
curl http://localhost:5000/health

# Today's usage data
curl http://localhost:5000/usage

# Usage for specific date range
curl "http://localhost:5000/usage?start_date=2024-01-01&end_date=2024-01-31"

# Subscription information
curl http://localhost:5000/subscription

# This month's billing data
curl http://localhost:5000/billing

# This month's cost data (using Unix timestamp)
curl "http://localhost:5000/costs?start_time=1704067200&end_time=1706745600"

# Projects list
curl "http://localhost:5000/projects?limit=20&include_archived=false"

# Usage summary
curl http://localhost:5000/summary
```

### API calls with Python:

```python
import requests

# Health check
response = requests.get('http://localhost:5000/health')
print(response.json())

# Usage data
response = requests.get('http://localhost:5000/usage', 
                       params={'date': '2024-01-01'})
print(response.json())

# Subscription info
response = requests.get('http://localhost:5000/subscription')
print(response.json())

# Costs data
response = requests.get('http://localhost:5000/costs', 
                       params={'start_time': '1704067200', 'end_time': '1706745600'})
print(response.json())

# Projects list
response = requests.get('http://localhost:5000/projects', 
                       params={'limit': '20', 'include_archived': 'false'})
print(response.json())

## Error Handling

The API handles the following error conditions:

- **400**: Invalid request parameters
- **401**: Missing or invalid API key
- **404**: Endpoint not found
- **500**: Server error or OpenAI API error

## Security

- API key is stored as an environment variable
- API key is validated in all requests
- Sensitive information is hidden in error messages

## Logging

The application logs all API calls and errors. Logs are written to the console.

## Notes

- Store your OpenAI API key securely
- Disable debug mode in production environment
- Consider OpenAI API rate limits for rate limiting 