#!/bin/bash

# Docker management scripts for ValidatorAI

set -e

case "$1" in
  "build")
    echo "Building production Docker image..."
    docker build -t validatorai:latest .
    ;;
  
  "build-dev")
    echo "Building development Docker image..."
    docker build -f Dockerfile.dev -t validatorai:dev .
    ;;
  
  "run")
    echo "Running production container..."
    docker run -d --name validatorai-app -p 5000:5000 --env-file .env validatorai:latest
    ;;
  
  "run-dev")
    echo "Running development container..."
    docker run -d --name validatorai-dev -p 5000:5000 --env-file .env -v $(pwd):/app validatorai:dev
    ;;
  
  "compose")
    echo "Starting with Docker Compose..."
    docker-compose up -d
    ;;
  
  "compose-dev")
    echo "Starting development with Docker Compose..."
    docker-compose --profile dev up -d
    ;;
  
  "stop")
    echo "Stopping containers..."
    docker-compose down
    docker stop validatorai-app validatorai-dev 2>/dev/null || true
    ;;
  
  "logs")
    echo "Showing logs..."
    docker-compose logs -f
    ;;
  
  "clean")
    echo "Cleaning up Docker resources..."
    docker-compose down --volumes --remove-orphans
    docker rmi validatorai:latest validatorai:dev 2>/dev/null || true
    docker system prune -f
    ;;
  
  "shell")
    echo "Opening shell in running container..."
    docker exec -it validatorai-app /bin/sh
    ;;
  
  "shell-dev")
    echo "Opening shell in development container..."
    docker exec -it validatorai-dev /bin/sh
    ;;
  
  *)
    echo "Usage: $0 {build|build-dev|run|run-dev|compose|compose-dev|stop|logs|clean|shell|shell-dev}"
    echo ""
    echo "Commands:"
    echo "  build       - Build production Docker image"
    echo "  build-dev   - Build development Docker image"
    echo "  run         - Run production container"
    echo "  run-dev     - Run development container"
    echo "  compose     - Start with Docker Compose (production)"
    echo "  compose-dev - Start with Docker Compose (development)"
    echo "  stop        - Stop all containers"
    echo "  logs        - Show container logs"
    echo "  clean       - Clean up Docker resources"
    echo "  shell       - Open shell in production container"
    echo "  shell-dev   - Open shell in development container"
    exit 1
    ;;
esac 