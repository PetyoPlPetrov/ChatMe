# Docker Setup for ChatMe

This document explains how to use Docker and Docker Compose to run the ChatMe microservices with hot-reloading for development.

## Architecture Overview

ChatMe uses a microservices architecture with two main services:

- **Core Service** - Handles user details and main application logic (port 5000)
- **Auth Service** - Handles authentication and authorization (port 5001)

## Prerequisites

- Docker Desktop or Docker Engine
- Docker Compose v3.8+

## Quick Start

### Development Mode (Hot-Reloading)

Start the development services with automatic rebuilding on file changes:

```bash
# Start all development services
docker-compose --profile development up

# Start specific service
docker-compose --profile development up chatme-core-dev
docker-compose --profile development up chatme-auth-dev

# Start in background (detached mode)
docker-compose --profile development up -d

# View logs
docker-compose logs -f
docker-compose logs -f chatme-core-dev
docker-compose logs -f chatme-auth-dev
```

The development services will:
- ✅ Auto-reload on code changes in `./core/src/` and `./auth/src/`
- ✅ Mount source files as volumes
- ✅ Run with nodemon for instant restarts
- ✅ Enable debug logging
- ✅ Include development dependencies

### Production Mode

Run the optimized production build:

```bash
# Start all production services
docker-compose --profile production up

# Start specific service
docker-compose --profile production up chatme-core-prod
docker-compose --profile production up chatme-auth-prod

# Start in background
docker-compose --profile production up -d
```

## Available Services

| Service | Port | Description |
|---------|------|-------------|
| `chatme-core-dev` | 5000 | Core development server with hot-reloading |
| `chatme-auth-dev` | 5001 | Auth development server with hot-reloading |
| `chatme-core-prod` | 5000 | Core production-optimized server |
| `chatme-auth-prod` | 5001 | Auth production-optimized server |

## Docker Compose Commands

### Basic Operations

```bash
# Build images
docker-compose build

# Start services
docker-compose up

# Start specific service (development)
docker-compose --profile development up chatme-server-dev

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f chatme-server-dev
```

### Development Workflow

```bash
# Build and start development server
docker-compose --profile development up --build chatme-server-dev

# Force rebuild (when package.json changes)
docker-compose build --no-cache chatme-server-dev

# Check service status
docker-compose ps

# Execute commands inside container
docker-compose exec chatme-server-dev npm test
```

### Production Deployment

```bash
# Production build and start
docker-compose --profile production up --build -d

# Check production logs
docker-compose logs -f chatme-server-prod

# Stop production
docker-compose --profile production down
```

## Volume Mounts

### Development Volumes

The development setup mounts these files/directories:

- `./server/src` → `/app/src` (read-only)
- `./server/package.json` → `/app/package.json` (read-only)
- `./server/tsconfig.json` → `/app/tsconfig.json` (read-only)
- `./server/nodemon.json` → `/app/nodemon.json` (read-only)

This allows instant hot-reloading when you modify source files locally.

### Why Read-Only Volumes?

Read-only (`:ro`) volumes prevent the container from accidentally modifying your host files while still allowing hot-reloading.

## Environment Variables

### Development

- `NODE_ENV=development`
- `PORT=5000`
- `LOG_LEVEL=debug`

### Production

- `NODE_ENV=production`
- `PORT=5000`

## Health Checks

Both containers include health checks that monitor the `/health` endpoint:

- **Interval**: 30s (15s for dev)
- **Timeout**: 10s (5s for dev)
- **Retries**: 3 (5 for dev)
- **Start Period**: 10s (5s for dev)

## Debugging

### View Container Logs

```bash
# Follow logs in real-time
docker-compose logs -f chatme-server-dev

# View last 100 lines
docker-compose logs --tail=100 chatme-server-dev
```

### Execute Commands in Container

```bash
# Get shell access
docker-compose exec chatme-server-dev sh

# Run npm commands
docker-compose exec chatme-server-dev npm test
docker-compose exec chatme-server-dev npm run build
```

### Debug with Node.js Inspector

The development container exposes port 9229 for Node.js debugging:

```bash
# Start with debug port exposed
docker-compose up chatme-server-dev

# Connect debugger to localhost:9229
```

## Troubleshooting

### Container Won't Start

1. Check if port 5000 is already in use:
   ```bash
   lsof -i :5000
   ```

2. Force rebuild if dependencies changed:
   ```bash
   docker-compose build --no-cache chatme-server-dev
   ```

### Hot-Reloading Not Working

1. Ensure you're using the development service:
   ```bash
   docker-compose --profile development up chatme-server-dev
   ```

2. Check if volumes are mounted correctly:
   ```bash
   docker-compose exec chatme-server-dev ls -la /app/src
   ```

### Permission Issues

On Linux/macOS, ensure your user owns the project files:
```bash
sudo chown -R $USER:$USER ./server
```

## Clean Up

Remove all containers, networks, and volumes:

```bash
# Stop and remove containers
docker-compose down

# Remove volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Complete cleanup
docker system prune -a
```

## File Structure

```
server/
├── docker-compose.yml              # Single compose file with profiles
├── Dockerfile                      # Production build
├── Dockerfile.dev                  # Development build
├── .dockerignore                   # Docker ignore rules
├── DOCKER.md                       # This documentation
└── src/                            # Source code (mounted as volume)
```

## Docker Compose Profiles

The simplified Docker setup uses **profiles** to separate development and production environments:

- **Development profile**: `--profile development`
  - Service: `chatme-server-dev`
  - Hot-reloading with volume mounts
  - Debug logging enabled
  - Debugger port exposed (9229)

- **Production profile**: `--profile production`
  - Service: `chatme-server-prod`
  - Optimized build
  - Resource limits
  - Structured logging

This eliminates the need for multiple Docker Compose files while maintaining clear separation between environments.

## Best Practices

1. **Use specific tags**: Pin Node.js versions in Dockerfiles
2. **Layer caching**: Copy package.json before source code
3. **Security**: Run as non-root user in production
4. **Health checks**: Always include health check endpoints
5. **Resource limits**: Set CPU and memory limits for production
6. **Logging**: Configure structured logging for containers

## Integration with GitHub Actions

The Docker setup integrates with the existing CI/CD pipeline:

- Development images for local testing
- Production images for deployment
- Health checks ensure service reliability
- Volume mounts enable rapid development iteration