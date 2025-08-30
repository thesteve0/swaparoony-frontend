# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production (runs TypeScript check and Vite build)
- `npm run lint` - Run ESLint with TypeScript rules
- `npm test` - Run tests with Vitest
- `npm run preview` - Preview production build on port 3000

## Architecture Overview

This is a React TypeScript frontend for a face swap application using PatternFly components with dark theme.

### Core Architecture Patterns

- **State Management**: React hooks with local state, no global state management library
- **Component Structure**: Functional components with TypeScript interfaces
- **UI Framework**: PatternFly v6 components with dark theme (`pf-v6-theme-dark`)
- **Camera Integration**: WebRTC MediaStream API with canvas-based photo capture and resizing
- **API Communication**: Fetch API with JSON payloads for KServe integration
- **Serving Infrastructure**: nginx reverse proxy for static files and API routing

### Key Application Flow

1. **Camera Initialization** (`src/components/Camera/CameraCapture.tsx:51`): Requests user media stream and displays video preview
2. **Photo Capture** (`src/components/Camera/CameraCapture.tsx:77`): Captures frame from video stream, resizes via canvas, and converts to blob
3. **Face Swap Processing** (`src/utils/api.ts:13`): Submits photo as FormData to backend API
4. **Results Display**: Shows base64-encoded swapped images in gallery layout

### Configuration System

Environment-based configuration in `src/config/app.config.ts`:
- API endpoints and base URL
- Camera dimensions and quality settings
- All settings have fallback defaults

### Component Architecture

- **AppLayout**: Main application wrapper with PatternFly page structure
- **CameraCapture**: Primary feature component handling camera workflow with state machine pattern
- **Utility Modules**: Camera operations (`src/utils/camera.ts`) and API calls (`src/utils/api.ts`)

### State Management Pattern

The app uses a state machine approach in the main camera component with states:
`idle` → `initializing` → `ready` → `captured` → `processing` → `results` | `error`

### nginx Reverse Proxy Architecture

**Production Serving**: nginx serves the application in OpenShift using standalone binary approach:

- **nginx Binary**: Downloaded via `nginx-binaries` npm package during S2I build
- **Port Configuration**: nginx listens on port 8080 (matches OpenShift service expectations)
- **Static File Serving**: Serves React build files from `/opt/app-root/src/dist`
- **SPA Routing**: Handles client-side routing with `try_files` fallback to `index.html`
- **MIME Types**: Custom `mime.types` file for proper content type handling
- **Future Proxy**: Ready for `/api/predict` reverse proxy to KServe service

**Key Files**:
- `nginx.conf` - nginx configuration for static serving and future proxy
- `mime.types` - MIME type mappings for web assets
- `download-nginx.mjs` - Node.js script using nginx-binaries API
- `.s2i/bin/assemble` - Custom S2I script for nginx setup during build

### Development Environment

- Vite dev server configured for host `0.0.0.0:3000` for container compatibility
- TypeScript strict mode enabled
- ESLint with React hooks and TypeScript rules
- nginx binary deployment maintains development workflow compatibility
