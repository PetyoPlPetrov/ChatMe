#!/bin/bash

# ChatMe Docker Cleanup Script
# This script stops all containers and removes all Docker images, volumes, and networks
# Use with caution - this will remove ALL Docker resources on your system

set -e

echo "🧹 ChatMe Docker Cleanup Script"
echo "================================"
echo "⚠️  WARNING: This will remove ALL Docker containers, images, volumes, and networks!"
echo ""

# Function to ask for confirmation
confirm() {
    read -p "$1 (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Operation cancelled."
        exit 1
    fi
}

# Function to run command with error handling
run_command() {
    local cmd="$1"
    local description="$2"

    echo "🔄 $description..."
    if eval "$cmd" 2>/dev/null; then
        echo "✅ $description completed"
    else
        echo "⚠️  $description - no resources found or already clean"
    fi
    echo ""
}

# Main cleanup options
echo "Choose cleanup level:"
echo "1) ChatMe only (recommended - removes only ChatMe containers, images, and volumes)"
echo "2) Complete system cleanup (removes ALL Docker resources)"
echo "3) Custom cleanup (interactive selection)"
echo ""

read -p "Select option (1-3): " -n 1 -r
echo ""

case $REPLY in
    1)
        echo "🎯 ChatMe-specific cleanup selected"
        confirm "Remove ChatMe containers, images, and volumes?"

        # Stop and remove ChatMe containers
        run_command "docker-compose -f docker-compose.dev.yml down --remove-orphans" "Stopping ChatMe containers"
        run_command "docker-compose -f docker-compose.prod.yml down --remove-orphans" "Stopping ChatMe prod containers (if any)"

        # Remove ChatMe images
        run_command "docker images | grep -E '(chatme|server-)' | awk '{print \$3}' | xargs -r docker rmi -f" "Removing ChatMe images"

        # Remove ChatMe volumes
        run_command "docker volume ls | grep chatme | awk '{print \$2}' | xargs -r docker volume rm" "Removing ChatMe volumes"

        echo "🎉 ChatMe cleanup completed!"
        ;;

    2)
        echo "💣 Complete system cleanup selected"
        confirm "⚠️  This will remove ALL Docker resources on your system. Continue?"

        # Stop all containers
        run_command "docker stop \$(docker ps -aq)" "Stopping all containers"

        # Remove all containers
        run_command "docker rm \$(docker ps -aq)" "Removing all containers"

        # Remove all images
        run_command "docker rmi \$(docker images -q) -f" "Removing all images"

        # Remove all volumes
        run_command "docker volume rm \$(docker volume ls -q)" "Removing all volumes"

        # Remove all networks (except default ones)
        run_command "docker network rm \$(docker network ls | grep -v 'bridge\|host\|none' | awk 'NR>1{print \$1}')" "Removing custom networks"

        # Clean up build cache
        run_command "docker builder prune -af" "Cleaning build cache"

        # System prune for good measure
        run_command "docker system prune -af --volumes" "Final system cleanup"

        echo "🎉 Complete system cleanup completed!"
        ;;

    3)
        echo "🔧 Custom cleanup selected"
        echo ""

        # Interactive cleanup options
        if confirm "Stop all running containers?"; then
            run_command "docker stop \$(docker ps -aq)" "Stopping all containers"
        fi

        if confirm "Remove all containers?"; then
            run_command "docker rm \$(docker ps -aq)" "Removing all containers"
        fi

        if confirm "Remove all images?"; then
            run_command "docker rmi \$(docker images -q) -f" "Removing all images"
        fi

        if confirm "Remove all volumes?"; then
            run_command "docker volume rm \$(docker volume ls -q)" "Removing all volumes"
        fi

        if confirm "Remove custom networks?"; then
            run_command "docker network rm \$(docker network ls | grep -v 'bridge\|host\|none' | awk 'NR>1{print \$1}')" "Removing custom networks"
        fi

        if confirm "Clean build cache?"; then
            run_command "docker builder prune -af" "Cleaning build cache"
        fi

        echo "🎉 Custom cleanup completed!"
        ;;

    *)
        echo "❌ Invalid option selected. Exiting."
        exit 1
        ;;
esac

# Show final status
echo ""
echo "📊 Current Docker Status:"
echo "========================"
echo "Containers: $(docker ps -a --format 'table {{.Names}}\t{{.Status}}' 2>/dev/null | wc -l | awk '{print $1-1}') total"
echo "Images: $(docker images --format 'table {{.Repository}}\t{{.Tag}}\t{{.Size}}' 2>/dev/null | wc -l | awk '{print $1-1}') total"
echo "Volumes: $(docker volume ls --format 'table {{.Name}}' 2>/dev/null | wc -l | awk '{print $1-1}') total"
echo "Networks: $(docker network ls --format 'table {{.Name}}' 2>/dev/null | wc -l | awk '{print $1-1}') total"

echo ""
echo "✨ Cleanup script completed successfully!"
echo "💡 Tip: Run './start.sh' to rebuild and start ChatMe services"