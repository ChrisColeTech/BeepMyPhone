# BeepMyPhone Technology Stack

## Backend
- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js
- **Language**: TypeScript 5.0+
- **Testing**: Jest with ts-jest
- **Build**: TypeScript compiler (tsc)
- **Dev**: Nodemon for hot reload
- **Linting**: ESLint

## Frontend  
- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.2
- **Language**: TypeScript 5.8.3
- **Bundler**: Vite
- **Linting**: ESLint 9.33.0 with React plugins
- **Development**: Vite dev server

## Desktop Application
- **Framework**: Electron
- **Builder**: electron-builder 24.9.0
- **Architecture**: Main process + renderer process

## Development Tools
- **Package Manager**: npm (>=8.0.0)
- **Concurrency**: concurrently for multi-process development
- **Process Management**: wait-on for service dependencies
- **Structure Generation**: Python-based generators in /tools/

## Project Structure
```
/
├── backend/app/          # Node.js/Express backend
├── frontend/app/         # React/Vite frontend  
├── electron/app/         # Electron desktop wrapper
├── mobile/               # Mobile apps (not started)
├── tools/                # Python generators
└── docs/                 # Project documentation
```

## Build Configuration
- **TypeScript**: ES2020 target, CommonJS modules, strict mode
- **Jest**: ts-jest preset, node environment
- **Electron Builder**: Cross-platform builds (Windows NSIS, macOS, Linux AppImage)