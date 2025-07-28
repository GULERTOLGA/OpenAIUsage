#!/bin/bash

echo "=================================================="
echo "Rebuilding Docker Containers"
echo "=================================================="

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down

# Build new images
echo "Building backend image..."
docker build -t gulertolga/openai-usage-api:latest .

echo "Building frontend image..."
docker build -f Dockerfile.frontend -t gulertolga/openai-usage-frontend:latest .

# Start containers
echo "Starting containers..."
docker-compose up -d

# Check status
echo "Checking container status..."
docker-compose ps

echo "=================================================="
echo "Rebuild complete!"
echo "=================================================="
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "==================================================" 