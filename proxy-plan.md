# nginx Reverse Proxy Implementation Plan

## Current State Analysis
- Frontend makes direct calls to KServe API at external URL causing CORS issues
- App configured via environment variables in `src/config/app.config.ts`
- Currently deployed in Kubernetes with ConfigMap for environment variables
- Using `oc new-app` with nodejs-20 base image for build and deployment

## Updated Approach Based on Requirements

### 1. Keep Existing `oc new-app` Build Flow
- Continue using `registry.access.redhat.com/ubi8/nodejs-20` base image
- Add nginx as dependency and configure within existing container
- Modify startup script to run nginx instead of `vite preview`

### 2. Use Automatic Kubernetes Service Discovery
- Leverage `SWAPAROONY_FACE_SWAP_PREDICTOR_SERVICE_HOST` environment variable (e.g., `172.30.134.170`)
- No need for external URLs in ConfigMap anymore
- Append `:predict` to the service host in nginx config

### 3. Create nginx Configuration
- Create `nginx.conf` that proxies `/api/predict` to `$SWAPAROONY_FACE_SWAP_PREDICTOR_SERVICE_HOST:predict`
- Serve static frontend files for all other routes
- No CORS headers needed (same origin)

### 4. Update Application Code
- Change `src/config/app.config.ts` to use relative path `/api`
- Keep `faceSwapEndpoint` as `/predict` 
- Remove external API URL handling

### 5. Update Package.json & Startup
- Add nginx to dependencies
- Modify `start` script to run nginx with custom config
- Ensure built files are served by nginx

### 6. Clean Up Configuration
- Remove `VITE_API_BASE_URL` from `config/configmap.yaml`
- Keep camera settings in ConfigMap

## Implementation Steps

### Step 1: Create nginx Configuration
Create `nginx.conf` file that:
- Listens on port 3000
- Serves static files from `/opt/app-root/src/dist`
- Proxies `/api/predict` to KServe service using environment variable
- Handles SPA routing with try_files

### Step 2: Update Package.json
- Add nginx dependency
- Update `start` script to run nginx instead of vite preview
- Add script to substitute environment variables in nginx config

### Step 3: Update Application Configuration
- Modify `src/config/app.config.ts` to use `/api` as baseUrl
- Keep `/predict` as faceSwapEndpoint

### Step 4: Clean Up ConfigMap
- Remove `VITE_API_BASE_URL` from `config/configmap.yaml`
- Keep camera configuration settings

### Step 5: Update Deployment Documentation
- Update `DEPLOYMENT.md` with new nginx-based approach
- Document how service discovery works

## Files to Create/Modify

### Create:
- `nginx.conf` - nginx configuration with reverse proxy

### Modify:
- `package.json` - add nginx dependency and update start script
- `src/config/app.config.ts` - use relative URLs
- `config/configmap.yaml` - remove API URL
- `DEPLOYMENT.md` - update deployment steps

## Benefits
- Keeps existing OpenShift build process intact
- Uses Kubernetes service discovery automatically
- Eliminates CORS completely
- Simpler configuration management
- No changes needed to existing React components

## Technical Details

### nginx Configuration Structure
```nginx
server {
    listen 3000;
    root /opt/app-root/src/dist;
    
    # Proxy API calls to KServe service
    location /api/predict {
        proxy_pass http://$SWAPAROONY_FACE_SWAP_PREDICTOR_SERVICE_HOST:predict;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Serve static files and handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Updated API Configuration
```typescript
export const appConfig: AppConfig = {
    api: {
        baseUrl: '/api',
        faceSwapEndpoint: '/predict',
    },
    // ... camera config unchanged
};
```

This approach maintains the existing build workflow while solving the CORS issue through same-origin requests.