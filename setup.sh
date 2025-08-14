#!/bin/bash

# Create directory structure for swaparoony-frontend
echo "Creating project directory structure..."

# Create main directories
mkdir -p .devcontainer
mkdir -p public
mkdir -p src/components/Layout
mkdir -p src/config
mkdir -p src/types
mkdir -p src/utils

# Create empty files that need to exist
touch .gitignore
touch package.json
touch tsconfig.json
touch vite.config.ts
touch index.html
touch README.md

# DevContainer files
touch .devcontainer/devcontainer.json

# Public files
touch public/favicon.ico

# Source files
touch src/main.tsx
touch src/App.tsx
touch src/App.css
touch src/components/Layout/AppLayout.tsx
touch src/components/Layout/index.ts
touch src/components/index.ts
touch src/config/app.config.ts
touch src/types/index.ts
touch src/utils/index.ts

echo "✅ Project structure created successfully!"
echo "📁 Directories: .devcontainer, public, src/{components/Layout, config, types, utils}"
echo "📄 Files: All configuration and source files created"
