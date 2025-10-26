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
    echo "Usage: ./start.sh [COMMAND] [SERVICE] [OPTIONS]"
    echo
    echo "Commands:"
    print_color $GREEN "  dev              Start development service with nodemon hot-reload"
    print_color $GREEN "  prod             Start production service (build first)"
    print_color $GREEN "  docker:dev       Start development services in Docker"
    print_color $GREEN "  docker:prod      Start production services in Docker"
    print_color $GREEN "  build            Build TypeScript to JavaScript"
    print_color $GREEN "  clean            Clean build directory"
    print_color $GREEN "  format           Format code with Prettier"
    print_color $GREEN "  install          Install dependencies"
    print_color $GREEN "  health           Check service health (if running)"
    echo
    echo "Services:"
    print_color $CYAN "  core             User details service (port 5000)"
    print_color $CYAN "  auth             Authentication service (port 5001)"
    print_color $CYAN "  all              All services (for Docker commands only)"
    echo
    echo "Options:"
    print_color $YELLOW "  --port PORT      Override default port (for single service dev/prod)"
    print_color $YELLOW "  --detached       Run Docker containers in background"
    print_color $YELLOW "  --logs           Follow Docker container logs"
    print_color $YELLOW "  --help           Show this help message"
    echo
    echo "Examples:"
    print_color $BLUE "  ./start.sh dev core"
    print_color $BLUE "  ./start.sh dev auth"
    print_color $BLUE "  ./start.sh dev core --port 3001"
    print_color $BLUE "  ./start.sh docker:dev all --detached"
    print_color $BLUE "  ./start.sh prod auth"
    echo
}

# Check if dependencies are installed
check_dependencies() {
    local service_dir=$1
    if [ ! -d "$service_dir/node_modules" ]; then
        print_color $YELLOW "📦 Installing dependencies for $service_dir service..."
        cd "$service_dir" && npm install && cd ..
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
    local service=$1
    local port=$2

    # Set default ports
    if [ "$service" = "core" ]; then
        port=${port:-5000}
    elif [ "$service" = "auth" ]; then
        port=${port:-5001}
    else
        print_color $RED "❌ Unknown service: $service"
        print_color $YELLOW "Available services: core, auth"
        exit 1
    fi

    print_color $GREEN "🔧 Starting $service development server with nodemon hot-reload..."
    print_color $BLUE "📍 Server will be available at: http://localhost:$port"
    print_color $YELLOW "💡 Press Ctrl+C to stop"
    echo

    check_dependencies "$service"

    cd "$service"
    if [ "$port" != "5000" ] && [ "$port" != "5001" ]; then
        PORT=$port npm run dev
    else
        npm run dev
    fi
}


# Start production server
start_prod() {
    local service=$1
    local port=$2

    # Set default ports
    if [ "$service" = "core" ]; then
        port=${port:-5000}
    elif [ "$service" = "auth" ]; then
        port=${port:-5001}
    else
        print_color $RED "❌ Unknown service: $service"
        print_color $YELLOW "Available services: core, auth"
        exit 1
    fi

    print_color $GREEN "🏭 Starting $service production server..."
    print_color $BLUE "📍 Server will be available at: http://localhost:$port"
    print_color $YELLOW "💡 Press Ctrl+C to stop"
    echo

    check_dependencies "$service"

    cd "$service"
    print_color $YELLOW "🔨 Building $service project..."
    npm run build

    print_color $GREEN "✅ Build complete. Starting server..."
    if [ "$port" != "5000" ] && [ "$port" != "5001" ]; then
        PORT=$port npm start
    else
        npm start
    fi
}

# Start Docker development
start_docker_dev() {
    local service=$1
    local detached=$2
    local follow_logs=$3

    if [ "$service" = "all" ]; then
        print_color $GREEN "🐳 Starting all Docker development services..."
        print_color $BLUE "📍 Core will be available at: http://localhost:5000"
        print_color $BLUE "📍 Auth will be available at: http://localhost:5001"

        if [ "$detached" = true ]; then
            print_color $YELLOW "🔄 Starting in background mode..."
            docker-compose -f docker-compose.dev.yml up -d
            print_color $GREEN "✅ All containers started in background"
            print_color $BLUE "💡 Use './start.sh docker:dev all --logs' to view logs"
            print_color $BLUE "💡 Use 'docker-compose -f docker-compose.dev.yml down' to stop"
        else
            print_color $YELLOW "💡 Press Ctrl+C to stop"
            echo
            docker-compose -f docker-compose.dev.yml up
        fi

        if [ "$follow_logs" = true ] && [ "$detached" = true ]; then
            echo
            print_color $BLUE "📋 Following container logs..."
            docker-compose -f docker-compose.dev.yml logs -f
        fi
    else
        local container_name="chatme-${service}-dev"
        local port
        if [ "$service" = "core" ]; then
            port="5000"
        elif [ "$service" = "auth" ]; then
            port="5001"
        else
            print_color $RED "❌ Unknown service: $service"
            print_color $YELLOW "Available services: core, auth, all"
            exit 1
        fi

        print_color $GREEN "🐳 Starting Docker $service development service..."
        print_color $BLUE "📍 Server will be available at: http://localhost:$port"

        if [ "$detached" = true ]; then
            print_color $YELLOW "🔄 Starting in background mode..."
            docker-compose -f docker-compose.dev.yml up -d "$container_name"
            print_color $GREEN "✅ Container started in background"
            print_color $BLUE "💡 Use './start.sh docker:dev $service --logs' to view logs"
            print_color $BLUE "💡 Use 'docker-compose -f docker-compose.dev.yml down' to stop"
        else
            print_color $YELLOW "💡 Press Ctrl+C to stop"
            echo
            docker-compose -f docker-compose.dev.yml up "$container_name"
        fi

        if [ "$follow_logs" = true ] && [ "$detached" = true ]; then
            echo
            print_color $BLUE "📋 Following container logs..."
            docker-compose -f docker-compose.dev.yml logs -f "$container_name"
        fi
    fi
}

# Start Docker production
start_docker_prod() {
    local service=$1
    local detached=$2
    local follow_logs=$3

    if [ "$service" = "all" ]; then
        print_color $GREEN "🐳 Starting all Docker production services..."
        print_color $BLUE "📍 Core will be available at: http://localhost:5000"
        print_color $BLUE "📍 Auth will be available at: http://localhost:5001"

        if [ "$detached" = true ]; then
            print_color $YELLOW "🔄 Starting in background mode..."
            docker-compose -f docker-compose.prod.yml up -d
            print_color $GREEN "✅ All containers started in background"
            print_color $BLUE "💡 Use './start.sh docker:prod all --logs' to view logs"
            print_color $BLUE "💡 Use 'docker-compose -f docker-compose.prod.yml down' to stop"
        else
            print_color $YELLOW "💡 Press Ctrl+C to stop"
            echo
            docker-compose -f docker-compose.prod.yml up
        fi

        if [ "$follow_logs" = true ] && [ "$detached" = true ]; then
            echo
            print_color $BLUE "📋 Following container logs..."
            docker-compose -f docker-compose.prod.yml logs -f
        fi
    else
        local container_name="chatme-${service}-prod"
        local port
        if [ "$service" = "core" ]; then
            port="5000"
        elif [ "$service" = "auth" ]; then
            port="5001"
        else
            print_color $RED "❌ Unknown service: $service"
            print_color $YELLOW "Available services: core, auth, all"
            exit 1
        fi

        print_color $GREEN "🐳 Starting Docker $service production service..."
        print_color $BLUE "📍 Server will be available at: http://localhost:$port"

        if [ "$detached" = true ]; then
            print_color $YELLOW "🔄 Starting in background mode..."
            docker-compose -f docker-compose.prod.yml up -d "$container_name"
            print_color $GREEN "✅ Container started in background"
            print_color $BLUE "💡 Use './start.sh docker:prod $service --logs' to view logs"
            print_color $BLUE "💡 Use 'docker-compose -f docker-compose.prod.yml down' to stop"
        else
            print_color $YELLOW "💡 Press Ctrl+C to stop"
            echo
            docker-compose -f docker-compose.prod.yml up "$container_name"
        fi

        if [ "$follow_logs" = true ] && [ "$detached" = true ]; then
            echo
            print_color $BLUE "📋 Following container logs..."
            docker-compose -f docker-compose.prod.yml logs -f "$container_name"
        fi
    fi
}

# Parse command line arguments
COMMAND=""
SERVICE=""
PORT=""
DETACHED=false
FOLLOW_LOGS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        dev|prod|docker:dev|docker:prod|build|clean|format|install|health)
            COMMAND="$1"
            shift
            ;;
        core|auth|all)
            SERVICE="$1"
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
        if [ -z "$SERVICE" ]; then
            print_color $RED "❌ Service not specified for dev command"
            print_color $YELLOW "Available services: core, auth"
            print_usage
            exit 1
        fi
        start_dev "$SERVICE" "$PORT"
        ;;
    "prod")
        if [ -z "$SERVICE" ]; then
            print_color $RED "❌ Service not specified for prod command"
            print_color $YELLOW "Available services: core, auth"
            print_usage
            exit 1
        fi
        start_prod "$SERVICE" "$PORT"
        ;;
    "docker:dev")
        if [ -z "$SERVICE" ]; then
            print_color $RED "❌ Service not specified for docker:dev command"
            print_color $YELLOW "Available services: core, auth, all"
            print_usage
            exit 1
        fi
        start_docker_dev "$SERVICE" "$DETACHED" "$FOLLOW_LOGS"
        ;;
    "docker:prod")
        if [ -z "$SERVICE" ]; then
            print_color $RED "❌ Service not specified for docker:prod command"
            print_color $YELLOW "Available services: core, auth, all"
            print_usage
            exit 1
        fi
        start_docker_prod "$SERVICE" "$DETACHED" "$FOLLOW_LOGS"
        ;;
    "build")
        if [ -z "$SERVICE" ]; then
            print_color $GREEN "🔨 Building all services..."
            for service in core auth; do
                print_color $YELLOW "Building $service service..."
                check_dependencies "$service"
                cd "$service" && npm run build && cd ..
                print_color $GREEN "✅ $service build complete!"
            done
        else
            print_color $GREEN "🔨 Building $SERVICE service..."
            check_dependencies "$SERVICE"
            cd "$SERVICE" && npm run build && cd ..
            print_color $GREEN "✅ Build complete!"
        fi
        ;;
    "clean")
        if [ -z "$SERVICE" ]; then
            print_color $YELLOW "🧹 Cleaning all services..."
            for service in core auth; do
                print_color $YELLOW "Cleaning $service service..."
                cd "$service" && npm run clean && cd ..
                print_color $GREEN "✅ $service clean complete!"
            done
        else
            print_color $YELLOW "🧹 Cleaning $SERVICE service..."
            cd "$SERVICE" && npm run clean && cd ..
            print_color $GREEN "✅ Clean complete!"
        fi
        ;;
    "format")
        if [ -z "$SERVICE" ]; then
            print_color $BLUE "💅 Formatting all services..."
            for service in core auth; do
                print_color $YELLOW "Formatting $service service..."
                check_dependencies "$service"
                cd "$service" && npm run format && cd ..
                print_color $GREEN "✅ $service formatted!"
            done
        else
            print_color $BLUE "💅 Formatting $SERVICE service..."
            check_dependencies "$SERVICE"
            cd "$SERVICE" && npm run format && cd ..
            print_color $GREEN "✅ Code formatted!"
        fi
        ;;
    "install")
        if [ -z "$SERVICE" ]; then
            print_color $YELLOW "📦 Installing dependencies for all services..."
            for service in core auth; do
                check_dependencies "$service"
                print_color $GREEN "✅ $service dependencies installed!"
            done
        else
            print_color $YELLOW "📦 Installing dependencies for $SERVICE service..."
            check_dependencies "$SERVICE"
            print_color $GREEN "✅ Dependencies installed!"
        fi
        ;;
    "health")
        if [ -z "$SERVICE" ]; then
            print_color $BLUE "🏥 Checking health of all services..."
            check_health "5000" # Core service
            check_health "5001" # Auth service
        else
            if [ "$SERVICE" = "core" ]; then
                check_health "${PORT:-5000}"
            elif [ "$SERVICE" = "auth" ]; then
                check_health "${PORT:-5001}"
            else
                print_color $RED "❌ Unknown service: $SERVICE"
                print_color $YELLOW "Available services: core, auth"
                exit 1
            fi
        fi
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