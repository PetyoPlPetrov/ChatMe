# Nginx Configuration Structure

This directory contains the nginx reverse proxy configuration for the ChatMe application using an include pattern for environment-specific settings.

## Directory Structure

```
nginx/
├── nginx.conf              # Base configuration (shared across environments)
├── conf.d/
│   ├── dev.conf            # Development-specific overrides
│   └── prod.conf           # Production-specific overrides
└── snippets/
    ├── cors-dev.conf       # Development CORS settings
    ├── cors-prod.conf      # Production CORS settings
    ├── security-dev.conf   # Development security headers
    └── security-prod.conf  # Production security headers
```

## How It Works

1. **Base Configuration**: `nginx.conf` contains shared settings like routing, health checks, and error handling
2. **Environment Overrides**: Files in `conf.d/` provide environment-specific settings like upstream definitions, rate limiting, and timeouts
3. **Reusable Snippets**: Files in `snippets/` contain modular configuration blocks for CORS and security headers

## Environment Differences

### Development (`dev.conf`)
- **CORS**: Permissive, allows multiple localhost ports (3000, 3001, 3004, 4000, etc.)
- **Rate Limiting**: Very relaxed (100 req/s)
- **Timeouts**: Shorter for faster feedback
- **Error Messages**: Verbose with debugging hints
- **Upstream**: Uses `chatme-*-dev` container names with localhost fallbacks

### Production (`prod.conf`)
- **CORS**: Strict, only configured production domains
- **Rate Limiting**: Conservative (10 req/s with burst limits)
- **Timeouts**: Longer for stability
- **Error Messages**: Minimal information disclosure
- **Upstream**: Uses `chatme-*-prod` container names with health checks
- **Additional Features**: Connection pooling, caching support, stricter security

## Usage

The appropriate configuration files are automatically built into custom Docker images:

### Development
```bash
./server/start.sh docker:dev all
```
Builds custom nginx image with: `nginx.conf`, `dev.conf`, `cors-dev.conf`, `security-dev.conf`

### Production
```bash
./server/start.sh docker:prod all
```
Builds custom nginx image with: `nginx.conf`, `prod.conf`, `cors-prod.conf`, `security-prod.conf`

## Docker Images

### Development Image (`Dockerfile.dev`)
- Removes default nginx configuration
- Copies development-specific configuration files
- Optimized for local development with hot-reload support

### Production Image (`Dockerfile`)
- Removes default nginx configuration
- Copies production-specific configuration files
- Optimized for production deployment with security hardening

## Customization

### Adding New Routes
1. Edit `nginx.conf` for routes that apply to all environments
2. Edit `conf.d/dev.conf` or `conf.d/prod.conf` for environment-specific routing

### Updating CORS
1. Edit `snippets/cors-dev.conf` for development CORS settings
2. Edit `snippets/cors-prod.conf` for production CORS settings
3. Update the `CORS_ORIGIN` environment variable in docker-compose files

### Modifying Security Headers
1. Edit `snippets/security-dev.conf` for development security headers
2. Edit `snippets/security-prod.conf` for production security headers

## Benefits

- **Clean Separation**: Development and production settings are clearly separated
- **Maintainable**: Shared configuration reduces duplication
- **Flexible**: Easy to customize per environment without affecting others
- **Secure**: Production-specific security hardening
- **Developer-Friendly**: Development settings optimized for local development