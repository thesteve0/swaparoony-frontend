# Swaparoony Frontend

React TypeScript frontend for the Swaparoony face swap trade show application with nginx reverse proxy integration for KServe API calls.

## Overview

This application provides a browser-based face swap experience using:
- **WebRTC Camera Integration** - Capture photos directly in the browser
- **Real-time Face Swapping** - Submit photos to KServe AI model for processing
- **nginx Reverse Proxy** - Eliminates CORS issues by proxying API calls
- **OpenShift Deployment** - Production-ready containerized deployment

## Architecture

### Production Deployment
- **nginx** serves static React files and proxies API calls to KServe
- **KServe Integration** via internal Kubernetes service discovery
- **Environment Variable Resolution** using `envsubst` template processing
- **Same-Origin Requests** eliminate CORS issues

### Key Components
- `nginx.conf.template` - nginx configuration with environment variable placeholders
- `src/config/app.config.ts` - Application configuration with camera settings
- `config/configmap.yaml` - Optional camera parameter overrides for deployment

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete OpenShift deployment instructions.

**Prerequisites**: KServe face-swap predictor service must be running in the target namespace.

**Quick Deploy:**
```bash
oc new-app registry.access.redhat.com/ubi8/nodejs-20:latest~https://github.com/thesteve0/swaparoony-frontend --name=swaparoony-frontend
oc patch svc/swaparoony-frontend -p '{"spec":{"ports":[{"name":"http","port":8080,"targetPort":8080,"protocol":"TCP"}]}}'
oc expose svc/swaparoony-frontend --port=http
oc patch route/swaparoony-frontend -p '{"spec":{"tls":{"termination":"edge","insecureEdgeTerminationPolicy":"Redirect"}}}'
```

## Development Setup

### Prerequisites
- Node.js 20+
- Docker Desktop (for dev containers)
- VS Code with Dev Containers extension (optional)

### Local Development

1. **Clone repository:**
```bash
git clone https://github.com/thesteve0/swaparoony-frontend.git
cd swaparoony-frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

4. **Open http://localhost:3000**

### Dev Container Setup (Optional)

1. Open project in VS Code
2. Select "Reopen in Container" when prompted
3. VS Code will build the dev container and install dependencies
4. Run `npm run dev` in the integrated terminal

## Configuration

### Camera Settings

Camera parameters can be configured via environment variables or the ConfigMap:

```yaml
# config/configmap.yaml
VITE_CAMERA_PREVIEW_WIDTH: "1024"    # Camera preview dimensions
VITE_CAMERA_PREVIEW_HEIGHT: "1024"
VITE_CAMERA_RESIZE_WIDTH: "640"      # Uploaded image dimensions  
VITE_CAMERA_RESIZE_HEIGHT: "640"
VITE_CAMERA_QUALITY: "0.8"           # Image compression quality (0.0-1.0)
```

### API Configuration

In production, the application automatically uses nginx reverse proxy to reach KServe services. No manual API configuration needed.

For development with external APIs, set environment variables in a `.env` file:
```env
VITE_API_BASE_URL=http://your-api-server:8000
```

## Tech Stack

- **React 18** with TypeScript for type-safe frontend development
- **PatternFly v6** UI components with dark theme
- **Vite** for fast build tooling and development server
- **nginx** for production static file serving and API proxying
- **nginx-binaries** npm package for containerized nginx deployment
- **Vitest** for unit testing
- **ESLint** for code quality

## Project Structure

```
swaparoony-frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Camera/         # Camera capture component
│   │   └── Layout/         # Application layout
│   ├── config/             # Application configuration
│   ├── types/              # TypeScript type definitions
│   └── utils/              # API calls and camera utilities
├── config/                 # Kubernetes ConfigMap
├── .s2i/                   # OpenShift S2I build scripts
├── nginx.conf.template     # nginx configuration template
├── mime.types              # MIME type mappings
└── download-nginx.mjs      # nginx binary download script
```

## Available Scripts

- `npm run dev` - Start Vite development server on port 3000
- `npm run build` - Build for production (TypeScript check + Vite build)
- `npm run start` - Production start (processes nginx template and starts nginx)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint with TypeScript rules
- `npm test` - Run Vitest unit tests

## Application Features

### Camera Integration
- WebRTC camera access with user permission handling
- Real-time video preview with canvas-based photo capture
- Automatic image resizing and compression before upload
- State management for camera initialization and photo capture flow

### Face Swap Processing
- Photo submission to KServe AI model via nginx proxy
- JSON API integration with multipart form data support
- Base64 image response handling and display
- Error handling for API failures

### UI/UX
- PatternFly dark theme for professional appearance
- Responsive design for various screen sizes
- Camera permissions handling and error states
- Photo gallery display for swapped results

## Known Issues / TODO

1. **Processing Indicator**: Once you click submit there is a bit of time where it is processing the images and the page is just blank. I need to add a "processing" image to sit there until it returns a response.

2. **Base Image Diversity**: It is only white male base images right now. There also just needs to be better base images overall.

3. **Performance Limitations**: There is only one GPU enabled node so if multiple people start hitting this it will definitely slow down.

## Contributing

1. Follow the existing code style and patterns
2. Run `npm run lint` before committing
3. Add tests for new functionality
4. Update documentation for significant changes

## License

See [LICENSE](./LICENSE) file for details.