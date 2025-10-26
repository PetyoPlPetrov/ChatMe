# ChatMe Server Start Scripts

This directory contains convenient start scripts to run the ChatMe microservices in different modes.

## Architecture Overview

ChatMe now uses a microservices architecture with two main services:

- **Core Service** (`core/`) - Handles user details and main application logic (port 5000)
- **Auth Service** (`auth/`) - Handles authentication and authorization (port 5001)

## Available Scripts

### Unix/Linux/Mac: `start.sh`
```bash
# Make executable (first time only)
chmod +x start.sh

# Show help
./start.sh --help
```

### Windows: `start.bat`
```cmd
# Show help
start.bat help
```

## Usage Examples

### Development Mode
```bash
# Start core service with nodemon hot-reload
./start.sh dev core

# Start auth service with nodemon hot-reload
./start.sh dev auth

# Start core service on different port
./start.sh dev core --port 3001

# Start auth service on different port
./start.sh dev auth --port 3002
```

### Production Mode
```bash
# Build and start core service in production mode
./start.sh prod core

# Build and start auth service in production mode
./start.sh prod auth

# Start core service on different port
./start.sh prod core --port 8080

# Start auth service on different port
./start.sh prod auth --port 8081
```

### Docker Mode
```bash
# Start all services in development mode with Docker
./start.sh docker:dev all

# Start only core service in development mode
./start.sh docker:dev core

# Start only auth service in development mode
./start.sh docker:dev auth

# Start all services in background mode
./start.sh docker:dev all --detached

# Follow logs of all detached containers
./start.sh docker:dev all --detached --logs

# Start all services in production mode with Docker
./start.sh docker:prod all

# Start specific service in production mode
./start.sh docker:prod core --detached
```

### Utility Commands
```bash
# Build all services
./start.sh build

# Build specific service
./start.sh build core
./start.sh build auth

# Clean all services
./start.sh clean

# Clean specific service
./start.sh clean core

# Format code for all services
./start.sh format

# Format code for specific service
./start.sh format core

# Install dependencies for all services
./start.sh install

# Install dependencies for specific service
./start.sh install core

# Check health of all services
./start.sh health

# Check health of specific service
./start.sh health core
./start.sh health auth --port 3001
```

## Features

### ✅ Cross-Platform Support
- **Unix/Linux/Mac**: `start.sh` (Bash script with colors)
- **Windows**: `start.bat` (Batch script)

### ✅ Multiple Run Modes
- **Development**: Hot-reload with nodemon
- **Production**: Build first, then run compiled JavaScript
- **Docker**: Both development and production containers

### ✅ Smart Dependency Management
- Automatically installs dependencies if `node_modules` doesn't exist
- No need to run `npm install` manually

### ✅ Port Configuration
- Default port: 5000
- Override with `--port` flag
- Supports any valid port number

### ✅ Docker Integration
- Seamless Docker Compose integration
- Background (`--detached`) and foreground modes
- Log following for detached containers
- Automatic container cleanup

### ✅ Health Checking
- Built-in health check functionality
- Validates server is running and responding
- Pretty-printed JSON output

### ✅ User-Friendly Interface
- Colored output for better visibility
- Clear status messages and progress indicators
- Comprehensive help system
- Error handling with meaningful messages

## Script Comparison

| Feature | npm scripts | start.sh/start.bat |
|---------|-------------|-------------------|
| Dependency check | ❌ | ✅ |
| Port override | Manual | ✅ Automatic |
| Docker integration | ❌ | ✅ |
| Health checking | ❌ | ✅ |
| Colored output | ❌ | ✅ |
| Help system | ❌ | ✅ |
| Cross-platform | Partial | ✅ |

## Technical Details

### Environment Variables
The scripts respect these environment variables:
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Node environment (set automatically)

### Dependencies
- **Node.js**: Version 20+ (automatically detected)
- **npm**: For package management
- **Docker**: For containerized deployment (optional)
- **curl**: For health checks (usually pre-installed)

### File Structure
```
server/
├── start.sh          # Unix/Linux/Mac start script
├── start.bat         # Windows start script
├── START_SCRIPTS.md  # This documentation
├── package.json      # npm scripts and dependencies
├── nodemon.json      # Nodemon configuration
├── Dockerfile        # Production Docker image
├── Dockerfile.dev    # Development Docker image
└── src/              # TypeScript source code
```

## Troubleshooting

### Permission Denied (Unix/Mac)
```bash
chmod +x start.sh
```

### Port Already in Use
```bash
# Check what's using the port
lsof -i :5000

# Use a different port
./start.sh dev --port 3001
```

### Docker Not Found
```bash
# Install Docker Desktop or Docker Engine
# macOS: brew install --cask docker
# Ubuntu: sudo apt install docker.io docker-compose
```

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
./start.sh install
```

## Integration with IDEs

### VS Code
Add to `.vscode/tasks.json`:
```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Start Development Server",
            "type": "shell",
            "command": "./start.sh",
            "args": ["dev"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "new"
            }
        }
    ]
}
```

### IntelliJ/WebStorm
1. Go to Run → Edit Configurations
2. Add new Shell Script configuration
3. Set Script path: `start.sh`
4. Set Script options: `dev`
5. Set Working directory: `server/`

## Contributing

When adding new functionality to the start scripts:

1. Update both `start.sh` and `start.bat`
2. Add documentation to this file
3. Test on multiple platforms
4. Ensure error handling is consistent
5. Update help text and examples

## License

These scripts are part of the ChatMe project and follow the same license terms.