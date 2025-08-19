# BeepMyPhone Development Commands

## Root Level Commands
```bash
# Development - runs all components concurrently
npm run dev

# Production build - builds all components
npm run build

# Production start - runs backend + electron
npm start

# Individual component development
npm run backend        # Backend dev server
npm run frontend       # Frontend dev server  
npm run electron       # Electron dev

# Individual builds
npm run backend:build
npm run frontend:build
npm run electron:build

# Distribution package
npm run bundle         # Build + electron-builder
```

## Backend Commands (from /backend/app/)
```bash
npm run dev           # Nodemon development server
npm run build         # TypeScript compilation
npm run start         # Production server
npm run test          # Jest test suite
npm run lint          # ESLint checking
npm run type-check    # TypeScript type checking
```

## Frontend Commands (from /frontend/app/)
```bash
npm run dev           # Vite development server
npm run build         # Vite production build
npm run type-check    # TypeScript type checking
npm run lint          # ESLint checking
npm run preview       # Preview production build
```

## System Commands (Linux)
```bash
# File operations
ls -la                # List files with details
find . -name "*.ts"   # Find TypeScript files
grep -r "text" .      # Search text in files
cd /path/to/dir       # Change directory

# Git operations
git status            # Check repository status
git add .             # Stage all changes
git commit -m "msg"   # Commit with message
git push              # Push to remote

# Process management
ps aux | grep node    # Find Node.js processes
pkill -f nodemon      # Kill nodemon processes
lsof -i :3001         # Check port usage
```

## Development Workflow
1. `npm run dev` - Start all development servers
2. Make code changes
3. `npm run type-check` - Verify TypeScript
4. `npm run lint` - Check code style  
5. `npm run test` - Run test suites
6. `npm run build` - Build for production
7. `npm run bundle` - Create distributable