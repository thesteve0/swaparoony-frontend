# Swaparoony Frontend

React TypeScript frontend for the Swaparoony face swap trade show application.

## Development Setup

### Prerequisites
- Docker Desktop
- VS Code with Dev Containers extension

### Getting Started

1. Clone repository:
```bash
git clone <repository-url>
cd swaparoony-frontend
```

2. Open in VS Code and select "Reopen in Container" when prompted

3. Start development server:
```bash
npm run dev
```

4. Open http://localhost:3000

## Configuration

Set environment variables in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_CAMERA_RESIZE_WIDTH=640
VITE_CAMERA_RESIZE_HEIGHT=640
VITE_CAMERA_QUALITY=0.8
```

## Tech Stack

- **React 18** with TypeScript
- **PatternFly** for UI components (dark theme)
- **Vite** for build tooling
- **Vitest** for testing

## Project Structure

```
src/
├── components/     # React components
├── config/         # Configuration files
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests
