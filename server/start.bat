@echo off
:: ChatMe Server Start Script for Windows
:: Provides easy options for running the server in different modes

setlocal enabledelayedexpansion

:: Print header
echo.
echo ^🚀 ChatMe Server Start Script
echo ================================
echo.

:: Check if command provided
if "%1"=="" (
    echo ❌ No command specified
    goto :usage
)

:: Parse command
set COMMAND=%1
set PORT=5000
set DETACHED=false

:: Parse additional arguments
:parse_args
if "%2"=="--port" (
    set PORT=%3
    shift
    shift
)
if "%2"=="--detached" (
    set DETACHED=true
    shift
)
if "%2"=="-d" (
    set DETACHED=true
    shift
)
if "%2"=="--help" goto :usage
if "%2"=="-h" goto :usage
if not "%2"=="" (
    shift
    goto :parse_args
)

:: Execute commands
if "%COMMAND%"=="dev" goto :dev
if "%COMMAND%"=="prod" goto :prod
if "%COMMAND%"=="docker:dev" goto :docker_dev
if "%COMMAND%"=="docker:prod" goto :docker_prod
if "%COMMAND%"=="build" goto :build
if "%COMMAND%"=="clean" goto :clean
if "%COMMAND%"=="format" goto :format
if "%COMMAND%"=="install" goto :install
if "%COMMAND%"=="health" goto :health
if "%COMMAND%"=="help" goto :usage

echo ❌ Unknown command: %COMMAND%
goto :usage

:dev
echo 🔧 Starting development server with nodemon hot-reload...
echo 📍 Server will be available at: http://localhost:%PORT%
echo 💡 Press Ctrl+C to stop
echo.
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)
if "%PORT%"=="5000" (
    npm run dev
) else (
    set PORT=%PORT% && npm run dev
)
goto :end


:prod
echo 🏭 Starting production server...
echo 📍 Server will be available at: http://localhost:%PORT%
echo 💡 Press Ctrl+C to stop
echo.
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)
echo 🔨 Building project...
npm run build
echo ✅ Build complete. Starting server...
if "%PORT%"=="5000" (
    npm start
) else (
    set PORT=%PORT% && npm start
)
goto :end

:docker_dev
echo 🐳 Starting Docker development server...
echo 📍 Server will be available at: http://localhost:5000
if "%DETACHED%"=="true" (
    echo 🔄 Starting in background mode...
    docker-compose --profile development up -d chatme-server-dev
    echo ✅ Container started in background
    echo 💡 Use 'docker-compose logs -f chatme-server-dev' to view logs
    echo 💡 Use 'docker-compose --profile development down' to stop
) else (
    echo 💡 Press Ctrl+C to stop
    echo.
    docker-compose --profile development up chatme-server-dev
)
goto :end

:docker_prod
echo 🐳 Starting Docker production server...
echo 📍 Server will be available at: http://localhost:5000
if "%DETACHED%"=="true" (
    echo 🔄 Starting in background mode...
    docker-compose --profile production up -d chatme-server-prod
    echo ✅ Container started in background
    echo 💡 Use 'docker-compose logs -f chatme-server-prod' to view logs
    echo 💡 Use 'docker-compose --profile production down' to stop
) else (
    echo 💡 Press Ctrl+C to stop
    echo.
    docker-compose --profile production up chatme-server-prod
)
goto :end

:build
echo 🔨 Building project...
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)
npm run build
echo ✅ Build complete!
goto :end

:clean
echo 🧹 Cleaning build directory...
npm run clean
echo ✅ Clean complete!
goto :end

:format
echo 💅 Formatting code...
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)
npm run format
echo ✅ Code formatted!
goto :end

:install
echo 📦 Installing dependencies...
npm install
echo ✅ Dependencies installed!
goto :end

:health
echo 🏥 Checking server health on port %PORT%...
curl -f "http://localhost:%PORT%/health" >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Server is healthy!
    curl -s "http://localhost:%PORT%/health"
) else (
    echo ❌ Server is not responding on port %PORT%
)
goto :end

:usage
echo Usage: start.bat [COMMAND] [OPTIONS]
echo.
echo Commands:
echo   dev              Start development server with nodemon hot-reload
echo   prod             Start production server (build first)
echo   docker:dev       Start development server in Docker
echo   docker:prod      Start production server in Docker
echo   build            Build TypeScript to JavaScript
echo   clean            Clean build directory
echo   format           Format code with Prettier
echo   install          Install dependencies
echo   health           Check server health (if running)
echo   help             Show this help message
echo.
echo Options:
echo   --port PORT      Override default port (5000)
echo   --detached       Run Docker containers in background
echo   --help           Show this help message
echo.
echo Examples:
echo   start.bat dev
echo   start.bat dev --port 3001
echo   start.bat docker:dev --detached
echo   start.bat prod
echo.
goto :end

:end
pause