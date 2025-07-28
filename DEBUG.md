# API Debugging Guide

## Problem Description
API requests are being made to `http://127.0.0.1:5000/api/projects` but the backend expects `/projects` endpoint.

## Root Cause Analysis

### 1. Development Mode Issues
- Frontend API service is using incorrect base URL
- CORS issues may exist
- Proxy configuration is not working properly

### 2. Production Mode Issues
- Docker configuration is working correctly
- Nginx proxy removes the `/api/` prefix

## Solutions Applied

### 1. Fixed API Configuration (`src/services/api.ts`)
```typescript
// Before (problematic):
baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000',

// After (fixed):
baseURL: process.env.NODE_ENV === 'production' ? '/api' : '',
```

### 2. Added CORS Support (`main.py`)
```python
from flask_cors import CORS

# Enable CORS for development
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])
```

### 3. Added `/api/` Prefix Routes to Backend (`main.py`)
```python
@app.route("/api/status")
def api_status_with_prefix():
    """API status endpoint with /api prefix"""
    return jsonify({
        "status": "running",
        "message": "OpenAI Usage API is running",
        "endpoints": {"costs": "/api/costs", "projects": "/api/projects"},
        "timestamp": datetime.now().isoformat(),
    })

@app.route("/api/costs", methods=["GET"])
@require_api_key
def get_costs_with_prefix():
    """Get OpenAI costs data with /api prefix"""
    return get_costs()

@app.route("/api/projects", methods=["GET"])
@require_api_key
def get_projects_with_prefix():
    """Get OpenAI projects list with /api prefix"""
    return get_projects()
```

### 4. Fixed Docker Nginx Configuration (`nginx.conf`)
```nginx
# Before (problematic):
location /api/ {
    proxy_pass http://backend:5000/;  # Removes /api/ prefix
}

# After (fixed):
location /api/ {
    proxy_pass http://backend:5000;   # Keeps /api/ prefix
}
```

### 5. Updated Dependencies (`requirements.txt`)
```
Flask==2.3.3
requests==2.31.0
python-dotenv==1.0.0
Flask-Caching==2.1.0
Flask-CORS==4.0.0
```

## Testing Steps

### 1. Test Backend API Endpoints
```bash
# Test API status
curl http://localhost:5000/api/status

# Test projects endpoint
curl http://localhost:5000/api/projects

# Test costs endpoint
curl http://localhost:5000/api/costs
```

### 2. Test Frontend API Calls
```bash
# Check browser console for API requests
# Should see requests to /api/projects instead of /projects
```

### 3. Test Docker Configuration
```bash
# Rebuild Docker containers
./rebuild_docker.sh  # Linux/Mac
# or
rebuild_docker.bat   # Windows

# Check container status
docker-compose ps

# Test Docker frontend
curl http://localhost:3000/api/projects
```

## Expected Behavior

### Development Mode
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- API calls: `http://localhost:5000/api/projects` ✅

### Production Mode (Docker)
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- API calls: `http://localhost:3000/api/projects` → `http://backend:5000/api/projects` ✅

## Debugging Commands

### Check Environment Variables
```bash
echo $OPENAI_API_KEY  # Linux/Mac
echo %OPENAI_API_KEY% # Windows
```

### Check Flask App Status
```bash
python -c "from main import app; print('Flask app imported successfully')"
```

### Check Docker Containers
```bash
docker-compose ps
docker-compose logs backend
docker-compose logs frontend
```

### Test API Endpoints
```bash
python test_api.py
```

## Common Issues and Solutions

### 1. 404 Error on `/api/projects`
**Cause**: Missing `/api/` routes in Flask backend
**Solution**: Added `/api/` prefix routes to `main.py`

### 2. 401 Error with Invalid API Key
**Cause**: Environment variable not set correctly
**Solution**: Set `OPENAI_API_KEY` environment variable

### 3. CORS Errors in Development
**Cause**: Missing CORS configuration
**Solution**: Added `flask-cors` and CORS configuration

### 4. Docker Frontend Not Working
**Cause**: Nginx proxy configuration removing `/api/` prefix
**Solution**: Fixed nginx.conf to keep `/api/` prefix

### 5. Duplicate Route Definitions
**Cause**: Multiple route decorators for same endpoint
**Solution**: Removed duplicate route definitions

## Verification Checklist

- [ ] Flask app imports successfully
- [ ] API status endpoint responds (200)
- [ ] `/api/projects` endpoint responds (200)
- [ ] `/api/costs` endpoint responds (200)
- [ ] Frontend can make API requests
- [ ] Docker containers start successfully
- [ ] Docker frontend serves static files
- [ ] Docker nginx proxies API requests correctly

## Environment Variables

Required environment variables in `.env` file:
```env
OPENAI_API_KEY=your-actual-openai-api-key
OPENAI_ORG_ID=your-organization-id (optional)
FLASK_ENV=development
FLASK_DEBUG=True
```

## Docker Rebuild Instructions

After making changes to the code, rebuild Docker containers:

```bash
# Stop containers
docker-compose down

# Build new images
docker build -t gulertolga/openai-usage-api:latest .
docker build -f Dockerfile.frontend -t gulertolga/openai-usage-frontend:latest .

# Start containers
docker-compose up -d

# Check status
docker-compose ps
``` 