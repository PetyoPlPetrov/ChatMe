# ChatMe

A [wip] chat application featuring React frontend and Node.js microservices backend. The architecture uses Docker containerization with an Nginx reverse proxy gateway for API routing and authentication.

## Project Structure

```
ChatMe/
├── frontend/                    # React TypeScript app with Redux Toolkit
├── server/                     # Node.js microservices
│   ├── core/                   # User management service (port 5000)
│   ├── auth/                   # Authentication service (port 5001)
│   ├── nginx/                  # Reverse proxy configuration
│   ├── docker-compose.dev.yml  # Development containers
│   ├── docker-compose.prod.yml # Production containers
│   └── start.sh               # Universal startup script
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI/CD pipeline
└── README.md
```

## Microservice Architecture

### Service Overview
- **Nginx Gateway** (port 8080): API gateway with authentication verification
- **Auth Service** (port 5001): JWT authentication with user verification
- **Core Service** (port 5000): User management and API endpoints
- **Frontend** (port 3000): React app with Redux state management

### Authentication Flow
1. Client requests API endpoints via Nginx gateway (port 8080)
2. Nginx performs auth_request to auth service (/api/v1/auth/verify)
3. Auth service validates JWT token from HTTP-only cookie and returns user headers
4. Nginx forwards authenticated requests to core service with user context headers
5. Direct auth endpoints (/api/v1/auth/*) bypass verification

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **Redux Toolkit** with RTK Query for state management
- **React Router** for navigation
- **Prettier** + **ESLint** for code quality
- **Jest** for testing

### Backend Stack
- **Node.js** with Express and TypeScript
- **JWT** authentication (jsonwebtoken)
- **CORS** enabled for cross-origin requests
- **Nodemon** for development hot-reload
- **Nginx** reverse proxy with auth_request module

### DevOps & Tools
- **Docker** with multi-stage builds
- **Docker Compose** for service orchestration
- **GitHub Actions** CI/CD pipeline
- **npm** package management

## Getting Started

### Prerequisites

- Node.js 18.x or 20.x
- npm
- Docker and Docker Compose (recommended)

### Quick Start (Docker - Recommended)

Start all services with Docker:
```bash
# Start all microservices in development mode
./server/start.sh docker:dev all

# Start in background and follow logs
./server/start.sh docker:dev all --detached --logs

# Start individual services
./server/start.sh docker:dev core    # Core service only
./server/start.sh docker:dev auth    # Auth service only
./server/start.sh docker:dev nginx   # Nginx gateway only
```

### Manual Development Setup

1. **Install Dependencies**

   Frontend:
   ```bash
   cd frontend
   npm install
   npm start                # Runs on http://localhost:3000
   ```

2. **Start Backend Services**

   Core Service:
   ```bash
   cd server/core
   npm install
   npm run dev             # Runs on http://localhost:5000
   ```

   Authentication Service:
   ```bash
   cd server/auth
   npm install
   npm run dev             # Runs on http://localhost:5001
   ```

   Or use the universal start script:
   ```bash
   # Individual services
   ./server/start.sh dev core          # Core service with hot-reload
   ./server/start.sh dev auth          # Auth service with hot-reload
   ```

### API Access

With Docker setup, all API calls go through the Nginx gateway:
- **Gateway URL**: http://localhost:8080
- **API Endpoints**: `/api/v1/auth/login`, `/api/v1/users`, etc.
- **Health Check**: http://localhost:8080/health

## Available Scripts

### Universal Start Script

The `server/start.sh` script provides comprehensive service management:

```bash
# Development commands
./server/start.sh dev core              # Start core service with hot-reload
./server/start.sh dev auth              # Start auth service with hot-reload
./server/start.sh dev core --port 3001  # Override default port

# Docker commands
./server/start.sh docker:dev all           # Start all services in Docker
./server/start.sh docker:dev all --detached # Background mode
./server/start.sh docker:prod all          # Production mode

# Build and maintenance
./server/start.sh build                    # Build all services
./server/start.sh format                   # Format all code
./server/start.sh clean                    # Clean build directories
./server/start.sh install                  # Install dependencies
./server/start.sh health                   # Check service health
```

### Frontend Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Individual Service Scripts

Each service (core/auth) supports:
- `npm run dev` - Development server with nodemon hot-reload
- `npm start` - Production server
- `npm run build` - Build TypeScript to JavaScript
- `npm run format` - Format code with Prettier
- `npm run clean` - Remove build directory

## API Endpoints

All API calls go through the Nginx gateway (http://localhost:8080):

### Authentication Endpoints (Direct to Auth Service)
- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/verify` - Token verification (internal)

### Core API Endpoints (Authenticated via Gateway)
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get specific user
- `GET /health` - Gateway health check

### Service Health Checks (Direct Access)
- `GET http://localhost:5000/health` - Core service health
- `GET http://localhost:5001/health` - Auth service health
- `GET http://localhost:8080/health` - Gateway health

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment. The pipeline runs on every push and pull request to `main` and `develop` branches.

### Pipeline Features

**Frontend CI:**
- ✅ Code formatting check with Prettier
- ✅ ESLint code quality checks
- ✅ TypeScript type checking
- ✅ Test execution with coverage
- ✅ Production build verification
- ✅ Build artifact upload

**Server CI (Both Core and Auth Services):**
- ✅ Code formatting check with Prettier
- ✅ TypeScript type checking
- ✅ Production build verification
- ✅ Build artifact upload

**Integration Tests:**
- ✅ End-to-end API testing
- ✅ Microservice health checks
- ✅ Cross-service integration validation
- ✅ Authentication flow testing

**Security & Quality:**
- ✅ npm audit security scanning
- ✅ Sensitive file detection
- ✅ Multi-version Node.js testing (18.x, 20.x)

### Local Quality Checks

Before pushing code, run these commands to ensure CI passes:

```bash
# Frontend checks
cd frontend
npm run format:check && npm run lint && npm run build && npm test

# Server checks (both core and auth services)
cd server/core
npm run format:check && npm run build

cd server/auth
npm run format:check && npm run build

# Or use the universal script for all services
./server/start.sh format  # Format all code
./server/start.sh build   # Build all services
```

### Auto-formatting

To automatically format your code:

```bash
# Format frontend code
cd frontend
npm run format

# Format server code (individual services)
cd server/core
npm run format

cd server/auth
npm run format

# Or format all services at once
./server/start.sh format
```

## Docker Configuration

### Development vs Production

- **Development**: Hot-reload volumes, exposed debugger ports (9229, 9230), permissive CORS
- **Production**: Optimized builds, resource limits, strict security policies, comprehensive logging

### Network Architecture

All services communicate via the `chatme-network` bridge network with service discovery by container names.

### Environment Configuration

The Nginx configuration uses environment-specific settings:
- **Development**: `docker-compose.dev.yml` with localhost CORS, verbose logging, relaxed rate limiting
- **Production**: `docker-compose.prod.yml` with strict CORS policies, minimal error disclosure, connection pooling

### Testing API Endpoints

```bash
# Health checks
curl http://localhost:8080/health           # Gateway health
curl http://localhost:5000/health           # Core service direct
curl http://localhost:5001/health           # Auth service direct

# Authentication flow
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123!"}'

# Authenticated API calls (cookies are sent automatically)
curl http://localhost:8080/api/v1/users \
  -H "Cookie: authToken=your_cookie_value"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run local quality checks
5. Push to your fork
6. Create a pull request

The CI pipeline will automatically run all checks when you create or update a pull request.