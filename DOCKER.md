# Docker Setup for OpenAI Usage API

This document explains how to run the OpenAI Usage API application using Docker.

## Prerequisites

- Docker
- Docker Compose
- OpenAI API Key

## Quick Start

1. **Set your OpenAI API key as an environment variable:**

```bash
# Windows PowerShell
$env:OPENAI_API_KEY="your-api-key-here"

# Windows Command Prompt
set OPENAI_API_KEY=your-api-key-here

# Linux/Mac
export OPENAI_API_KEY="your-api-key-here"
```

2. **Build and run the application:**

```bash
docker-compose up --build
```

3. **Access the application:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Docker Architecture

The application consists of two services:

### Backend Service (`backend`)
- **Image**: Python 3.11 slim
- **Port**: 5000
- **Features**:
  - Flask application with caching
  - OpenAI API integration
  - Health checks
  - Non-root user for security

### Frontend Service (`frontend`)
- **Image**: Nginx Alpine
- **Port**: 3000
- **Features**:
  - React TypeScript application
  - Nginx reverse proxy
  - Static file serving
  - API proxying to backend

## Configuration

### Environment Variables

The following environment variables can be set:

- `OPENAI_API_KEY` (required): Your OpenAI API key
- `OPENAI_ORG_ID` (optional): Your OpenAI organization ID

### Volumes

- `./logs:/app/logs`: Application logs directory

### Networks

- `openai-network`: Internal network for service communication

## Docker Commands

### Build and Start
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### View Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

### Rebuild Services
```bash
# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild all services
docker-compose build
```

### Health Checks
```bash
# Check service status
docker-compose ps

# Check health status
docker inspect openai-usage-backend | grep Health -A 10
```

## Development with Docker

### Development Mode

For development, you can run services individually:

```bash
# Run only backend
docker-compose up backend

# Run only frontend
docker-compose up frontend
```

### Hot Reload

For development with hot reload:

1. **Backend Development:**
```bash
# Run backend with volume mount for code changes
docker run -it --rm \
  -p 5000:5000 \
  -v $(pwd):/app \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  openai-usage-backend
```

2. **Frontend Development:**
```bash
# Run frontend with volume mount
docker run -it --rm \
  -p 3000:3000 \
  -v $(pwd):/app \
  -w /app \
  node:18-alpine \
  sh -c "npm install && npm start"
```

## Production Deployment

### Using Docker Compose

1. **Set production environment variables:**
```bash
export OPENAI_API_KEY="your-production-api-key"
export FLASK_ENV=production
```

2. **Run in production mode:**
```bash
docker-compose -f docker-compose.yml up -d
```

### Using Docker Swarm

1. **Initialize swarm:**
```bash
docker swarm init
```

2. **Deploy stack:**
```bash
docker stack deploy -c docker-compose.yml openai-usage
```

### Using Kubernetes

1. **Create namespace:**
```bash
kubectl create namespace openai-usage
```

2. **Apply configurations:**
```bash
kubectl apply -f k8s/
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
```bash
# Check what's using the port
lsof -i :5000
lsof -i :80

# Stop conflicting services
sudo systemctl stop nginx  # if nginx is running
```

2. **Permission denied:**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Or run with sudo (not recommended for production)
sudo docker-compose up
```

3. **API key not found:**
```bash
# Verify environment variable
echo $OPENAI_API_KEY

# Set it if missing
export OPENAI_API_KEY="your-api-key"
```

4. **Build cache issues:**
```bash
# Clear Docker build cache
docker builder prune

# Rebuild without cache
docker-compose build --no-cache
```

### Debugging

1. **Access container shell:**
```bash
# Backend container
docker exec -it openai-usage-backend /bin/bash

# Frontend container
docker exec -it openai-usage-frontend /bin/sh
```

2. **Check container logs:**
```bash
# Real-time logs
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

3. **Inspect container:**
```bash
# Container details
docker inspect openai-usage-backend

# Container processes
docker top openai-usage-backend
```

## Security Considerations

1. **Never commit API keys to version control**
2. **Use secrets management in production**
3. **Run containers as non-root users**
4. **Keep base images updated**
5. **Scan images for vulnerabilities**

## Performance Optimization

1. **Use multi-stage builds** (already implemented)
2. **Optimize layer caching** (already implemented)
3. **Use .dockerignore** (already implemented)
4. **Consider using Alpine images** (already implemented)

## Monitoring

1. **Health checks** are configured for both services
2. **Logs** are available through Docker Compose
3. **Metrics** can be collected using Docker stats:
```bash
docker stats openai-usage-backend openai-usage-frontend
``` 