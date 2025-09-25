# OpenShift Deployment Instructions

## Prerequisites

**Assumption**: The KServe face-swap predictor service is already running in your OpenShift namespace.

This deployment guide assumes you have:
- ✅ KServe service `swaparoony-face-swap-predictor` running in the target namespace
- ✅ Access to an OpenShift cluster with `oc` CLI configured
- ✅ Permissions to create applications, services, and routes in the namespace

**To verify the KServe service exists:**
```bash
# Check that the KServe predictor service is running
oc get svc swaparoony-face-swap-predictor

# Should show output like:
# NAME                               TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)   AGE
# swaparoony-face-swap-predictor     ClusterIP   172.30.134.170   <none>        80/TCP    21h
```

If the KServe service doesn't exist, deploy it first before proceeding.

---

## Complete Frontend Deployment

Deploy the React face-swap frontend with nginx reverse proxy integration:

### Step 1: Deploy the Application

```bash
# Create the application from GitHub repository
oc new-app registry.access.redhat.com/ubi8/nodejs-20:latest~https://github.com/thesteve0/swaparoony-frontend --name=swaparoony-frontend

# Update service to use correct port (8080) for nginx and add proper port name
oc patch svc/swaparoony-frontend -p '{"spec":{"ports":[{"name":"http","port":8080,"targetPort":8080,"protocol":"TCP"}]}}'

# Expose the service as a secure route with TLS
oc expose svc/swaparoony-frontend --port=http
oc patch route/swaparoony-frontend -p '{"spec":{"tls":{"termination":"edge","insecureEdgeTerminationPolicy":"Redirect"}}}'

# Configure route timeout for AI processing (KServe can take several minutes)
oc annotate route swaparoony-frontend haproxy.router.openshift.io/timeout=300s
```

### Step 2: Configure Camera Settings (Optional)

```bash
# Apply camera configuration settings
oc apply -f config/configmap.yaml

# Set environment variables for build time (Vite needs these during build)
oc set env bc/swaparoony-frontend --from=configmap/swaparoony-frontend-config

# Set environment variables for runtime
oc set env deployment/swaparoony-frontend --from=configmap/swaparoony-frontend-config

# Trigger a new build with the environment variables
oc start-build swaparoony-frontend
```

### Step 3: Monitor Deployment

```bash
# Check build status
oc logs -f bc/swaparoony-frontend

# Check pod status
oc get pods -l deployment=swaparoony-frontend

# Check deployment logs
oc logs -f deployment/swaparoony-frontend

# Get the external route URL
oc get route swaparoony-frontend -o jsonpath='{.spec.host}'
```

---

## Architecture Overview

### nginx Reverse Proxy Implementation

The application uses nginx as both a static file server and reverse proxy:

- **Static Files**: nginx serves React build files from `/opt/app-root/src/dist`
- **API Proxy**: nginx proxies `/api/predict` requests to the KServe service
- **Environment Resolution**: Uses `envsubst` to resolve environment variables at startup
- **Same-Origin**: Eliminates CORS issues by serving API and frontend from same origin

### Key Technical Details

- **nginx Binary**: Downloaded via `nginx-binaries` npm package during S2I build
- **Port**: nginx listens on port 8080 (matching OpenShift service expectations)
- **Template Processing**: `nginx.conf.template` processed with `envsubst` at startup
- **Service Discovery**: Uses Kubernetes environment variable `SWAPAROONY_FACE_SWAP_PREDICTOR_SERVICE_HOST`
- **API Endpoint**: Proxies to `/v1/models/swaparoony-face-swap:predict` on the KServe service

### Startup Process

1. Container starts and runs `npm start`
2. `export DOLLAR='$'` sets variable for nginx built-in variable escaping
3. `envsubst` processes template: `nginx.conf.template` → `nginx.conf`
4. Environment variables resolved:
   - `${SWAPAROONY_FACE_SWAP_PREDICTOR_SERVICE_HOST}` → actual service IP
   - `${DOLLAR}host` → `$host` (nginx built-in variable)
5. nginx starts with processed configuration

---

## Verification & Testing

### 1. Basic Connectivity
```bash
# Get your application URL
APP_URL=$(oc get route swaparoony-frontend -o jsonpath='{.spec.host}')
echo "Application URL: https://$APP_URL"

# Test frontend loads
curl -I https://$APP_URL
```

### 2. Full Application Test
1. Open the application URL in a browser
2. Grant camera permissions when prompted
3. Take a photo using the camera interface
4. Submit the photo for face swapping
5. Verify you receive swapped images back

### 3. API Proxy Test
```bash
# Test that the API proxy is working (from inside a pod)
oc debug deployment/swaparoony-frontend -- curl -I http://localhost:8080/api/predict
```

---

## Troubleshooting

### Build Issues

**ImageStreamTag Error:**
```bash
# Check available Node.js versions in your cluster
oc get imagestreams -n openshift | grep nodejs

# Use nodejs-20 if nodejs-22 is unavailable
oc new-app registry.access.redhat.com/ubi8/nodejs-20:latest~https://github.com/thesteve0/swaparoony-frontend --name=swaparoony-frontend
```

**Build Fails:**
```bash
# Check build logs for errors
oc logs -f bc/swaparoony-frontend

# Common issues:
# - npm install failures
# - TypeScript compilation errors
# - nginx binary download failures
```

### Runtime Issues

**Pod CrashLoopBackOff:**
```bash
# Check application logs
oc logs deployment/swaparoony-frontend

# Common issues:
# - nginx configuration syntax errors
# - Missing environment variables
# - Permission issues
```

**nginx Configuration Issues:**
```bash
# Debug nginx template processing
oc debug deployment/swaparoony-frontend -- /bin/bash -c "
  export DOLLAR='\$' && 
  envsubst < /opt/app-root/src/nginx.conf.template > /tmp/nginx.conf && 
  cat /tmp/nginx.conf
"
```

**API Proxy Not Working:**
```bash
# Verify KServe service is accessible
oc get svc swaparoony-face-swap-predictor

# Check environment variables in pod
oc debug deployment/swaparoony-frontend -- env | grep SWAPAROONY

# Test internal service connectivity
oc debug deployment/swaparoony-frontend -- curl -v http://swaparoony-face-swap-predictor/v1/models/swaparoony-face-swap:predict
```

### Port/Service Issues

**Port Mismatch:**
```bash
# Fix service port mapping if needed
oc patch svc/swaparoony-frontend -p '{"spec":{"ports":[{"name":"http","port":8080,"targetPort":8080,"protocol":"TCP"}]}}'

# Verify route configuration
oc get route swaparoony-frontend -o yaml
```

---

## Configuration Files

### Camera Settings (`config/configmap.yaml`)
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: swaparoony-frontend-config
data:
  VITE_CAMERA_PREVIEW_WIDTH: "1024"    # Camera preview dimensions
  VITE_CAMERA_PREVIEW_HEIGHT: "1024"
  VITE_CAMERA_RESIZE_WIDTH: "640"      # Uploaded image dimensions  
  VITE_CAMERA_RESIZE_HEIGHT: "640"
  VITE_CAMERA_QUALITY: "0.8"           # Image compression quality
```

### Key Application Files
- `nginx.conf.template` - nginx configuration template with environment variable placeholders
- `mime.types` - MIME type mappings for web assets
- `download-nginx.mjs` - Node.js script using nginx-binaries API
- `.s2i/bin/assemble` - Custom S2I script for nginx setup
- `src/config/app.config.ts` - Application configuration with fallback defaults

---

## Success Criteria

✅ **Deployment Complete When:**
- Build completes successfully without errors
- Pod is running and ready (1/1)
- Route is accessible and returns the React application
- Camera functionality works in the browser
- Face swap submission completes and returns swapped images
- No CORS errors in browser console

The application should now work end-to-end with full KServe integration via nginx reverse proxy.