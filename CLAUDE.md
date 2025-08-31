# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **React TypeScript frontend for a face swap trade show application** that integrates with KServe AI models via nginx reverse proxy. The application captures photos through WebRTC camera integration and submits them to a face-swapping AI service.

## User Preferences & Coding Style

### Communication Style
- **Direct and concise**: User prefers minimal explanations, no verbose preambles
- **Action-oriented**: Focus on implementation over theory
- **Problem-solving approach**: User wants solutions, not detailed explanations of problems
- **Git workflow**: User frequently requests commits with specific messages and immediate builds

### Technical Preferences
- **OpenShift/Kubernetes native**: All deployments target OpenShift with `oc` CLI
- **Environment-based configuration**: Uses ConfigMaps and environment variables over hardcoded values  
- **Documentation-driven**: User values comprehensive README and deployment documentation
- **Practical over perfect**: Prefers working solutions over theoretical optimizations

### Development Workflow
- User often runs builds immediately after commits: `git commit → git push → oc start-build`
- Frequently uses `oc debug` for troubleshooting container issues
- Values step-by-step deployment instructions that work from scratch
- Prefers todo lists for tracking complex multi-step tasks

## Environment Context

### Cluster Information
- **Platform**: OpenShift cluster
- **Namespace**: `face-swapper` 
- **Node.js Runtime**: `registry.access.redhat.com/ubi8/nodejs-20:latest`
- **GPU Limitations**: Single GPU-enabled node (performance bottleneck)

### Service Dependencies
- **KServe Service**: `swaparoony-face-swap-predictor` 
  - **Port**: 80 (ClusterIP: 172.30.134.170)
  - **Endpoint**: `/v1/models/swaparoony-face-swap:predict`
  - **Namespace**: `face-swapper`
  - **Type**: ClusterIP service for internal communication

### Application URLs & Routes
- **Frontend Service**: `swaparoony-frontend` (port 8080)
- **Frontend Route**: Exposed via OpenShift route with TLS edge termination
- **API Proxying**: nginx proxies `/api/predict` → KServe service internally

## Architecture Overview

### Production Architecture (Current State)
- **nginx Reverse Proxy**: Serves static files + proxies KServe API calls
- **Environment Variable Resolution**: Uses `envsubst` to process `nginx.conf.template` at startup
- **Same-Origin Requests**: Eliminates CORS issues by serving API and frontend from same origin
- **Kubernetes Service Discovery**: Automatic environment variable injection for service communication

### Key Technical Components

#### nginx Integration
- **Template**: `nginx.conf.template` with `${VARIABLE}` placeholders
- **Processing**: `envsubst` resolves variables at container startup 
- **Binary**: Downloaded via `nginx-binaries` npm package during S2I build
- **Port**: 8080 (matches OpenShift service expectations)
- **Special Variables**: `${DOLLAR}` escapes nginx built-in variables like `$host`

#### React Application
- **Framework**: React 18 with TypeScript
- **UI Library**: PatternFly v6 with dark theme (`pf-v6-theme-dark`)
- **State Management**: React hooks with local state (no Redux/Zustand)
- **Camera Integration**: WebRTC MediaStream API with canvas-based photo capture
- **API Communication**: Fetch API with multipart FormData for image upload

#### Build Process
- **S2I Build**: Custom `.s2i/bin/assemble` script downloads nginx binary
- **Vite Build**: TypeScript compilation + static asset bundling
- **nginx Startup**: Template processing → configuration generation → server start

### Application Flow & State Machine

The main camera component follows this state progression:
```
idle → initializing → ready → captured → processing → results | error
```

1. **Camera Initialization** (`src/components/Camera/CameraCapture.tsx`): WebRTC media stream setup
2. **Photo Capture**: Canvas-based frame capture with automatic resizing
3. **API Submission** (`src/utils/api.ts`): FormData upload to `/api/predict`
4. **Results Display**: Base64 image gallery from KServe response

## Development Commands

### Local Development
- `npm run dev` - Start Vite development server on port 3000
- `npm run build` - Build for production (TypeScript check + Vite build)
- `npm run start` - Production start (envsubst + nginx)
- `npm run lint` - Run ESLint with TypeScript rules
- `npm test` - Run tests with Vitest
- `npm run preview` - Preview production build locally

### OpenShift Operations
```bash
# Quick deployment (requires KServe service to exist)
oc new-app registry.access.redhat.com/ubi8/nodejs-20:latest~https://github.com/thesteve0/swaparoony-frontend --name=swaparoony-frontend
oc patch svc/swaparoony-frontend -p '{"spec":{"ports":[{"name":"http","port":8080,"targetPort":8080,"protocol":"TCP"}]}}'
oc expose svc/swaparoony-frontend --port=http
oc patch route/swaparoony-frontend -p '{"spec":{"tls":{"termination":"edge","insecureEdgeTerminationPolicy":"Redirect"}}}'

# Build and deploy cycle
git add . && git commit -m "message" && git push && oc start-build swaparoony-frontend

# Debugging
oc debug deployment/swaparoony-frontend -- /bin/bash
oc logs -f deployment/swaparoony-frontend
```

## Configuration System

### Camera Settings (`config/configmap.yaml`)
```yaml
VITE_CAMERA_PREVIEW_WIDTH: "1024"    # Camera preview dimensions
VITE_CAMERA_PREVIEW_HEIGHT: "1024"   
VITE_CAMERA_RESIZE_WIDTH: "640"      # Upload image dimensions
VITE_CAMERA_RESIZE_HEIGHT: "640"     
VITE_CAMERA_QUALITY: "0.8"           # Compression quality (0.0-1.0)
```

### API Configuration (`src/config/app.config.ts`)
- **Production**: `baseUrl: '/api'` + `faceSwapEndpoint: '/predict'` (nginx proxy)
- **Development**: Can override with `VITE_API_BASE_URL` environment variable
- **Fallback Defaults**: All camera settings have hardcoded fallbacks

## Current TODOs / Known Issues

### Priority Issues
1. **Processing Indicator**: No loading state during image processing - page goes blank while waiting for API response
2. **Base Image Diversity**: Currently only white male base images, needs better variety
3. **Performance Bottleneck**: Single GPU node causes slowdowns with multiple concurrent users

### Technical Debt
- No global state management (consider if app grows significantly)
- Limited error handling for edge cases
- No retry logic for failed API calls

## File Structure & Key Locations

```
swaparoony-frontend/
├── src/
│   ├── components/Camera/CameraCapture.tsx   # Main camera component (state machine)
│   ├── config/app.config.ts                  # App configuration with defaults
│   ├── utils/api.ts                          # KServe API integration
│   └── utils/camera.ts                       # Camera utilities
├── config/configmap.yaml                     # Kubernetes ConfigMap for camera settings
├── nginx.conf.template                       # nginx config with env var placeholders
├── mime.types                                # Custom MIME types for nginx
├── download-nginx.mjs                        # nginx binary download script
├── .s2i/bin/assemble                         # Custom S2I build script
├── DEPLOYMENT.md                             # Complete deployment instructions
└── package.json                              # Contains envsubst startup logic
```

## Important Implementation Notes

### nginx Environment Variables
- **Critical**: nginx requires `env` directive to access shell variables, but we use `envsubst` preprocessing instead
- **Template Pattern**: `${VARIABLE}` for env vars, `${DOLLAR}variable` for nginx built-ins
- **Service Discovery**: `SWAPAROONY_FACE_SWAP_PREDICTOR_SERVICE_HOST` auto-injected by Kubernetes

### OpenShift Integration
- **S2I Process**: Node.js build → nginx download → static file generation
- **Port Mapping**: Container:8080 ↔ Service:8080 ↔ Route:https
- **TLS Termination**: Edge termination at route level
- **Internal Communication**: Uses Kubernetes service discovery (no external routes needed)

### Development vs Production
- **Development**: Vite dev server on port 3000
- **Production**: nginx on port 8080 with reverse proxy
- **API Calls**: Development uses external URL, production uses internal proxy

This context should enable quick onboarding for any new development tasks or troubleshooting.