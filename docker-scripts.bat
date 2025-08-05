@echo off
setlocal enabledelayedexpansion

if "%1"=="build" (
    echo Building production Docker image...
    docker build -t validatorai:latest .
    goto :eof
)

if "%1"=="build-dev" (
    echo Building development Docker image...
    docker build -f Dockerfile.dev -t validatorai:dev .
    goto :eof
)

if "%1"=="run" (
    echo Running production container...
    docker run -d --name validatorai-app -p 5000:5000 --env-file .env validatorai:latest
    goto :eof
)

if "%1"=="run-dev" (
    echo Running development container...
    docker run -d --name validatorai-dev -p 5000:5000 --env-file .env -v %cd%:/app validatorai:dev
    goto :eof
)

if "%1"=="compose" (
    echo Starting with Docker Compose...
    docker-compose up -d
    goto :eof
)

if "%1"=="compose-dev" (
    echo Starting development with Docker Compose...
    docker-compose --profile dev up -d
    goto :eof
)

if "%1"=="stop" (
    echo Stopping containers...
    docker-compose down
    docker stop validatorai-app 2>nul
    docker stop validatorai-dev 2>nul
    goto :eof
)

if "%1"=="logs" (
    echo Showing logs...
    docker-compose logs -f
    goto :eof
)

if "%1"=="clean" (
    echo Cleaning up Docker resources...
    docker-compose down --volumes --remove-orphans
    docker rmi validatorai:latest 2>nul
    docker rmi validatorai:dev 2>nul
    docker system prune -f
    goto :eof
)

if "%1"=="shell" (
    echo Opening shell in production container...
    docker exec -it validatorai-app /bin/sh
    goto :eof
)

if "%1"=="shell-dev" (
    echo Opening shell in development container...
    docker exec -it validatorai-dev /bin/sh
    goto :eof
)

echo Usage: %0 {build^|build-dev^|run^|run-dev^|compose^|compose-dev^|stop^|logs^|clean^|shell^|shell-dev}
echo.
echo Commands:
echo   build       - Build production Docker image
echo   build-dev   - Build development Docker image
echo   run         - Run production container
echo   run-dev     - Run development container
echo   compose     - Start with Docker Compose (production^)
echo   compose-dev - Start with Docker Compose (development^)
echo   stop        - Stop all containers
echo   logs        - Show container logs
echo   clean       - Clean up Docker resources
echo   shell       - Open shell in production container
echo   shell-dev   - Open shell in development container
goto :eof 