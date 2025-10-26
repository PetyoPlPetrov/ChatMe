# Nginx Configuration - envsubst Template Approach

## Overview
The nginx configuration uses a **template-based approach** with environment variable substitution (envsubst) to handle development and production differences in a single template file.

## Files
- `nginx.conf` - Base nginx configuration with events and http blocks
- `nginx.conf.template` - Master template with environment variable placeholders

## How It Works
1. **Docker startup**: nginx:alpine processes `/etc/nginx/templates/*.template` files
2. **envsubst**: Replaces `${VARIABLE}` placeholders with environment variable values
3. **Output**: Generated config saved to `/etc/nginx/conf.d/nginx.conf`
4. **Include**: Base `nginx.conf` includes all files from `/etc/nginx/conf.d/`

## Environment Variables
The template uses 40+ environment variables to customize:
- **Service endpoints**: `${AUTH_SERVICE_HOST}`, `${CORE_SERVICE_HOST}`
- **Rate limiting**: `${API_RATE_LIMIT}`, `${AUTH_RATE_LIMIT}`
- **CORS settings**: `${CORS_ORIGIN}`, `${CORS_METHODS}`
- **Security headers**: `${CSP_POLICY}`, `${X_FRAME_OPTIONS}`
- **Timeouts**: `${AUTH_CONNECT_TIMEOUT}`, `${API_READ_TIMEOUT}`
- **Production features**: `${PROD_CACHE_CONFIG}`, `${PROD_BUFFER_SETTINGS}`

See `docker-compose.dev.yml` and `docker-compose.prod.yml` for complete variable definitions.

## Benefits
✅ **Single source of truth** - One template instead of 5+ separate files
✅ **No file mounting complexity** - Just 3 volume mounts total
✅ **Environment consistency** - Same template, different variables
✅ **Easy maintenance** - Modify variables instead of multiple config files
✅ **Proper CORS handling** - Headers defined once per location block

## Development vs Production
**Development:**
- Permissive CORS (`http://localhost:3004`)
- High rate limits (`100r/s`)
- Relaxed security headers
- Backup upstream servers
- Verbose logging

**Production:**
- Strict CORS (domain validation)
- Low rate limits (`10r/s`)
- Security headers (HSTS, CSP)
- Connection pooling & keepalive
- Structured logging with minimal PII

## Rollback Using Git
If you need to revert to the previous multi-file approach:

```bash
# Check git history for the commit before envsubst migration
git log --oneline server/nginx/

# Revert to previous approach (replace COMMIT_HASH)
git checkout COMMIT_HASH -- server/nginx/
git checkout COMMIT_HASH -- server/docker-compose.dev.yml
git checkout COMMIT_HASH -- server/docker-compose.prod.yml

# Or create a revert commit
git revert COMMIT_HASH
```

No temporary backup files needed - git history is the source of truth!