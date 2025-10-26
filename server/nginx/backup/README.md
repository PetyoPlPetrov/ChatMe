# Nginx Dockerfiles - Archived

These Dockerfiles have been archived as they are no longer used in the current configuration.

The nginx setup has been refactored to use direct config file mounting instead of building custom Docker images.

## Files in this backup:
- `Dockerfile` - Original production nginx Dockerfile
- `Dockerfile.dev` - Original development nginx Dockerfile

## Current Configuration
The nginx service now uses the standard `nginx:alpine` image with volume mounts for configuration files:

### Development:
```yaml
volumes:
  - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
  - ./nginx/conf.d/dev.conf:/etc/nginx/conf.d/dev.conf:ro
  - ./nginx/conf.d/default.conf:/etc/nginx/conf.d/default.conf:ro
  - ./nginx/snippets/cors-dev.conf:/etc/nginx/snippets/cors-dev.conf:ro
  - ./nginx/snippets/security-dev.conf:/etc/nginx/snippets/security-dev.conf:ro
```

### Production:
```yaml
volumes:
  - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
  - ./nginx/conf.d/prod.conf:/etc/nginx/conf.d/prod.conf:ro
  - ./nginx/conf.d/default.conf:/etc/nginx/conf.d/default.conf:ro
  - ./nginx/snippets/cors-prod.conf:/etc/nginx/snippets/cors-prod.conf:ro
  - ./nginx/snippets/security-prod.conf:/etc/nginx/snippets/security-prod.conf:ro
```

## Benefits of new approach:
1. No need to rebuild nginx image when config changes
2. Easier development workflow - config changes are immediately available
3. Simpler deployment - just standard nginx:alpine image
4. Better separation of concerns - config files are clearly separated by environment