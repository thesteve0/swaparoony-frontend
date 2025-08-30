# OpenShift Deployment Instructions

## Phase 1: Basic Deployment

Deploy the current application to OpenShift using Node.js 22 runtime:

```bash
# Create the application from GitHub repository with proper port configuration
# Option 1: Try nodejs-20 if nodejs-22 is not available
oc new-app registry.access.redhat.com/ubi8/nodejs-20:latest~https://github.com/thesteve0/swaparoony-frontend --name=swaparoony-frontend

# Option 2: If nodejs-22 is available in your cluster, use:
# oc new-app registry.access.redhat.com/ubi8/nodejs-22:latest~https://github.com/thesteve0/swaparoony-frontend --name=swaparoony-frontend

# Update service to use correct port (3000) and add proper port name
oc patch svc/swaparoony-frontend -p '{"spec":{"ports":[{"name":"http","port":80,"targetPort":3000,"protocol":"TCP"}]}}'

# Expose the service as a secure route with TLS
oc expose svc/swaparoony-frontend --port=http
oc patch route/swaparoony-frontend -p '{"spec":{"tls":{"termination":"edge","insecureEdgeTerminationPolicy":"Redirect"}}}'

# Check deployment status
oc get pods -l deployment=swaparoony-frontend

# Get the external route URL
oc get route swaparoony-frontend
```

## Verification Steps

1. **Check Build Status:**
   ```bash
   oc logs -f bc/swaparoony-frontend
   ```

2. **Check Pod Status:**
   ```bash
   # List all pods (shows actual pod names with random suffixes)
   oc get pods
   
   # Check deployment logs
   oc logs -f deployment/swaparoony-frontend
   
   # Or check specific pod logs (replace with actual pod name)
   oc logs swaparoony-frontend-6fcdd88567-6djvh
   ```

3. **Access Application:**
   - Get route URL: `oc get route swaparoony-frontend -o jsonpath='{.spec.host}'`
   - Open URL in browser
   - Note: Camera functionality will work, but face swap submission will fail (expected in Phase 1)

## Troubleshooting

- **ImageStreamTag Error:** If you get "unable to find latest tagged image" for nodejs-22:
  ```bash
  # Check available Node.js versions in your cluster
  oc get imagestreams -n openshift | grep nodejs
  
  # Use nodejs-20 instead (works with React 18 + TypeScript)
  oc new-app registry.access.redhat.com/ubi8/nodejs-20:latest~https://github.com/thesteve0/swaparoony-frontend --name=swaparoony-frontend
  ```
- **Build Fails:** Check that package.json scripts are correct
- **Pod CrashLoopBackOff:** Check application logs with `oc logs`
- **Route Not Accessible:** Verify route exists with `oc get routes`
- **Port Mismatch Issues:** If you have an existing deployment with wrong ports:
  ```bash
  # Fix service port mapping (Node.js app runs on 3000, not 8080)
  oc patch svc/swaparoony-frontend -p '{"spec":{"ports":[{"name":"http","port":80,"targetPort":3000,"protocol":"TCP"}]}}'
  
  # Add TLS to existing route
  oc patch route/swaparoony-frontend -p '{"spec":{"tls":{"termination":"edge","insecureEdgeTerminationPolicy":"Redirect"}}}'
  
  # Verify route configuration
  oc get route swaparoony-frontend -o yaml
  ```

## Next Steps

After successful deployment, proceed to Phase 2: API format changes for KServe integration.
