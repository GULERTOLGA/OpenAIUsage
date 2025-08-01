# OpenAI Usage API - Flask Application

A modern Flask application that provides a REST API for accessing OpenAI usage data with intelligent caching and a React TypeScript frontend.

## 🐳 Docker Hub

**Docker Images:**
- Backend: `gulertolga/openai-usage-api:latest`
- Frontend: `gulertolga/openai-usage-frontend:latest`

**Docker Hub Repository:** https://hub.docker.com/r/gulertolga/openai-usage-api

## Features

### Backend (Flask API)
- **Intelligent Caching**: Flask-Caching with 1-hour cache duration for `/costs` and `/projects` endpoints
- **Cost Data**: Get OpenAI cost data with date range selection and project grouping
- **Projects List**: Get OpenAI projects with search and pagination
- **Error Handling**: Comprehensive error handling and logging
- **API Key Validation**: Secure API key validation for all endpoints
- **Date Normalization**: Automatic end-time normalization for consistent caching

### Frontend (React TypeScript)
- **Modern UI**: Bootstrap-based responsive design
- **Date Range Selector**: Interactive date range selection (This Month, Today, Last Week, Last 30 Days, Last Month)
- **Usage Dashboard**: Real-time usage data with project breakdown
- **Projects Management**: Searchable projects table with pagination
- **Type Safety**: Full TypeScript implementation
- **Dynamic Navigation**: Simplified navigation with Usage and Projects pages

## Installation

### Prerequisites
- Python 3.7+
- Node.js 14+
- OpenAI API Key

### Backend Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:

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
# Windows PowerShell
$env:OPENAI_ORG_ID="your-org-id-here"

# Windows Command Prompt
set OPENAI_ORG_ID=your-org-id-here

# Linux/Mac
export OPENAI_ORG_ID="your-org-id-here"
```

**Note:** If you have multiple OpenAI organizations, you can set the `OPENAI_ORG_ID` environment variable to specify which organization's data to access. This is optional - if not set, the API will use your default organization.

### Frontend Setup

1. Install Node.js dependencies:
```bash
npm install
```

2. Build the frontend:
```bash
npm run build
```

## Running the Application

### Option 1: Docker (Recommended)

**Prerequisites:**
- Docker
- Docker Compose
- OpenAI API Key

**Quick Start:**
```bash
# Set your OpenAI API key
export OPENAI_API_KEY="your-api-key-here"

# Optionally set your OpenAI Organization ID (if you have multiple organizations)
export OPENAI_ORG_ID="your-org-id-here"

# Run with Docker Hub images
docker-compose up

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

**Alternative: Pull and run directly**
```bash
# Pull images from Docker Hub
docker pull gulertolga/openai-usage-api:latest
docker pull gulertolga/openai-usage-frontend:latest

# Set environment variables
export OPENAI_API_KEY="your-api-key-here"
export OPENAI_ORG_ID="your-org-id-here"  # Optional

# Run with docker-compose
docker-compose up
```

**For detailed Docker instructions, see [DOCKER.md](DOCKER.md)**

### Option 2: Manual Setup

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

### Option 3: Manual Running

1. Start the backend:
```bash
python main.py
```

2. Build the frontend:
```bash
npm install
npm run build
```

3. The application will be available at `http://localhost:5000`

## API Endpoints

### 1. Root (Frontend)
```
GET /
```
Serves the React frontend application.

### 2. Costs Data
```
GET /costs?start_time=1704067200&end_time=1706745600&group_by=project_id&limit=31
```
Gets OpenAI cost data with intelligent caching.

**Query Parameters:**
- `start_time`: Start time (Unix seconds) - **Required**
- `end_time`: End time (Unix seconds) - Optional (normalized to end of day)
- `bucket_width`: Time bucket width (default: "1d")
- `group_by`: Grouping fields (project_id, line_item) - Supports multiple values
- `limit`: Number of buckets to return (1-180, default: 7)
- `page`: Cursor for pagination
- `project_ids`: Cost data for specific projects - Supports multiple values

**Features:**
- **Caching**: 1-hour cache duration for improved performance
- **Date Normalization**: End times are normalized to 23:59:59 for consistent caching
- **Multiple Parameters**: Supports multiple group_by and project_ids values

### 3. Projects List
```
GET /projects?after=proj_abc&limit=20&include_archived=false
```
Gets the list of OpenAI projects with caching.

**Query Parameters:**
- `after`: Cursor for pagination (object ID)
- `include_archived`: Include archived projects (default: false)
- `limit`: Number of projects to return (1-100, default: 20)

**Features:**
- **Caching**: 1-hour cache duration
- **Pagination**: Support for cursor-based pagination
- **Archive Filtering**: Option to include/exclude archived projects

## Frontend Features

### Usage Dashboard
- **Date Range Selector**: Choose from predefined ranges (This Month, Today, Last Week, Last 30 Days, Last Month)
- **Summary Cards**: Total Cost, Project Count, Model Usage
- **Projects Table**: Detailed usage breakdown by project with:
  - Project names and descriptions
  - Total cost and daily averages
  - Model usage badges
  - Percentage of total cost
- **Real-time Data**: Automatic data refresh based on selected date range

### Projects Management
- **Searchable Table**: Search projects by name, ID, or description
- **Pagination**: Navigate through large project lists
- **Status Badges**: Visual indicators for project status (Active, Archived)
- **Permission Badges**: Display user permissions (Admin, Write, Read Only)
- **Date Formatting**: Localized date display

## Example Usage

### API calls with cURL:

```bash
# Get cost data for this month
curl "http://localhost:5000/costs?start_time=1704067200&end_time=1706745600&group_by=project_id&limit=31"

# Get projects list
curl "http://localhost:5000/projects?limit=20&include_archived=false"

# Get projects with pagination
curl "http://localhost:5000/projects?after=proj_abc&limit=10"
```

### API calls with Python:

```python
import requests

# Get cost data
response = requests.get('http://localhost:5000/costs', 
                       params={
                           'start_time': '1704067200',
                           'end_time': '1706745600',
                           'group_by': 'project_id',
                           'limit': '31'
                       })
print(response.json())

# Get projects list
response = requests.get('http://localhost:5000/projects', 
                       params={'limit': '20', 'include_archived': 'false'})
print(response.json())
```

## Caching System

The application uses Flask-Caching with the following features:

- **Cache Duration**: 1 hour (3600 seconds)
- **Cache Type**: Simple in-memory cache
- **Cache Keys**: Generated from endpoint and normalized parameters
- **Cache Invalidation**: Automatic expiration after 1 hour
- **Cache Logging**: Cache hits and misses are logged

### Cached Endpoints:
- `/costs` - Cost data with normalized date parameters
- `/projects` - Projects list with all parameters

## Error Handling

The API handles the following error conditions:

- **400**: Invalid request parameters (e.g., missing start_time)
- **401**: Missing or invalid API key
- **404**: Endpoint not found
- **500**: Server error or OpenAI API error

## Security

- API key is stored as an environment variable
- API key is validated in all requests using `@require_api_key` decorator
- Sensitive information is hidden in error messages
- CORS is handled appropriately for frontend integration

## Logging

The application logs:
- All API calls and responses
- Cache hits and misses
- Error conditions with detailed information
- OpenAI API errors with status codes

## Development Notes

- **Debug Mode**: Enabled by default for development
- **Hot Reload**: Frontend supports hot reloading in development
- **Type Safety**: Full TypeScript implementation for frontend
- **Responsive Design**: Bootstrap-based responsive UI
- **Date Handling**: Consistent date formatting and timezone handling

## Production Considerations

- Disable debug mode in production
- Consider using Redis or Memcached for caching in production
- Implement rate limiting for API endpoints
- Set up proper logging configuration
- Configure CORS appropriately for your domain
- Consider OpenAI API rate limits 