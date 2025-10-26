#!/bin/bash

# ChatMe Server Start Script
# Provides easy options for running the server in different modes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

# Print header
print_header() {
    echo
    print_color $CYAN "🚀 ChatMe Server Start Script"
    print_color $CYAN "================================"
    echo
}

# Print usage information
print_usage() {
    print_header
    echo "Usage: ./start.sh [COMMAND] [OPTIONS]"
    echo
    echo "Commands:"
    print_color $GREEN "  dev              Start development server with nodemon hot-reload"
    print_color $GREEN "  prod             Start production server (build first)"
    print_color $GREEN "  docker:dev       Start development server in Docker"
    print_color $GREEN "  docker:prod      Start production server in Docker"
    print_color $GREEN "  build            Build TypeScript to JavaScript"
    print_color $GREEN "  clean            Clean build directory"
    print_color $GREEN "  format           Format code with Prettier"
    print_color $GREEN "  install          Install dependencies"
    print_color $GREEN "  health           Check server health (if running)"
    echo
    echo "Options:"
    print_color $YELLOW "  --port PORT      Override default port (5000)"
    print_color $YELLOW "  --detached       Run Docker containers in background"
    print_color $YELLOW "  --logs           Follow Docker container logs"
    print_color $YELLOW "  --help           Show this help message"
    echo
    echo "Examples:"
    print_color $BLUE "  ./start.sh dev"
    print_color $BLUE "  ./start.sh dev --port 3001"
    print_color $BLUE "  ./start.sh docker:dev --detached"
    print_color $BLUE "  ./start.sh prod"
    echo
}

# Check if dependencies are installed
check_dependencies() {
    if [ ! -d "node_modules" ]; then
        print_color $YELLOW "📦 Installing dependencies..."
        npm install
    fi
}

# Check server health
check_health() {
    local port=${1:-5000}
    print_color $BLUE "🏥 Checking server health on port $port..."

    if curl -f "http://localhost:$port/health" > /dev/null 2>&1; then
        print_color $GREEN "✅ Server is healthy!"
        curl -s "http://localhost:$port/health" | python3 -m json.tool 2>/dev/null || curl -s "http://localhost:$port/health"
    else
        print_color $RED "❌ Server is not responding on port $port"
        return 1
    fi
}

# Start development server
start_dev() {
    local port=${1:-5000}
    print_color $GREEN "🔧 Starting development server with nodemon hot-reload..."
    print_color $BLUE "📍 Server will be available at: http://localhost:$port"
    print_color $YELLOW "💡 Press Ctrl+C to stop"
    echo

    check_dependencies

    if [ "$port" != "5000" ]; then
        PORT=$port npm run dev
    else
        npm run dev
    fi
}


# Start production server
start_prod() {
    local port=${1:-5000}
    print_color $GREEN "🏭 Starting production server..."
    print_color $BLUE "📍 Server will be available at: http://localhost:$port"
    print_color $YELLOW "💡 Press Ctrl+C to stop"
    echo

    check_dependencies

    print_color $YELLOW "🔨 Building project..."
    npm run build

    print_color $GREEN "✅ Build complete. Starting server..."
    if [ "$port" != "5000" ]; then
        PORT=$port npm start
    else
        npm start
    fi
}

# Start Docker development
start_docker_dev() {
    local detached=$1
    local follow_logs=$2

    print_color $GREEN "🐳 Starting Docker development server..."
    print_color $BLUE "📍 Server will be available at: http://localhost:5000"

    if [ "$detached" = true ]; then
        print_color $YELLOW "🔄 Starting in background mode..."
        docker-compose --profile development up -d chatme-server-dev
        print_color $GREEN "✅ Container started in background"
        print_color $BLUE "💡 Use './start.sh docker:dev --logs' to view logs"
        print_color $BLUE "💡 Use 'docker-compose --profile development down' to stop"
    else
        print_color $YELLOW "💡 Press Ctrl+C to stop"
        echo
        docker-compose --profile development up chatme-server-dev
    fi

    if [ "$follow_logs" = true ] && [ "$detached" = true ]; then
        echo
        print_color $BLUE "📋 Following container logs..."
        docker-compose logs -f chatme-server-dev
    fi
}

# Start Docker production
start_docker_prod() {
    local detached=$1
    local follow_logs=$2

    print_color $GREEN "🐳 Starting Docker production server..."
    print_color $BLUE "📍 Server will be available at: http://localhost:5000"

    if [ "$detached" = true ]; then
        print_color $YELLOW "🔄 Starting in background mode..."
        docker-compose --profile production up -d chatme-server-prod
        print_color $GREEN "✅ Container started in background"
        print_color $BLUE "💡 Use './start.sh docker:prod --logs' to view logs"
        print_color $BLUE "💡 Use 'docker-compose --profile production down' to stop"
    else
        print_color $YELLOW "💡 Press Ctrl+C to stop"
        echo
        docker-compose --profile production up chatme-server-prod
    fi

    if [ "$follow_logs" = true ] && [ "$detached" = true ]; then
        echo
        print_color $BLUE "📋 Following container logs..."
        docker-compose logs -f chatme-server-prod
    fi
}

# Parse command line arguments
COMMAND=""
PORT="5000"
DETACHED=false
FOLLOW_LOGS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        dev|prod|docker:dev|docker:prod|build|clean|format|install|health)
            COMMAND="$1"
            shift
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        --detached|-d)
            DETACHED=true
            shift
            ;;
        --logs|-l)
            FOLLOW_LOGS=true
            shift
            ;;
        --help|-h)
            print_usage
            exit 0
            ;;
        *)
            print_color $RED "❌ Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
done

# Execute command
case $COMMAND in
    "dev")
        start_dev "$PORT"
        ;;
    "prod")
        start_prod "$PORT"
        ;;
    "docker:dev")
        start_docker_dev "$DETACHED" "$FOLLOW_LOGS"
        ;;
    "docker:prod")
        start_docker_prod "$DETACHED" "$FOLLOW_LOGS"
        ;;
    "build")
        print_color $GREEN "🔨 Building project..."
        check_dependencies
        npm run build
        print_color $GREEN "✅ Build complete!"
        ;;
    "clean")
        print_color $YELLOW "🧹 Cleaning build directory..."
        npm run clean
        print_color $GREEN "✅ Clean complete!"
        ;;
    "format")
        print_color $BLUE "💅 Formatting code..."
        check_dependencies
        npm run format
        print_color $GREEN "✅ Code formatted!"
        ;;
    "install")
        print_color $YELLOW "📦 Installing dependencies..."
        npm install
        print_color $GREEN "✅ Dependencies installed!"
        ;;
    "health")
        check_health "$PORT"
        ;;
    "")
        print_color $RED "❌ No command specified"
        print_usage
        exit 1
        ;;
    *)
        print_color $RED "❌ Unknown command: $COMMAND"
        print_usage
        exit 1
        ;;
esac