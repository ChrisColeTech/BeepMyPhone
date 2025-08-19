#!/usr/bin/env python3
"""
Configuration file templates (package.json, tsconfig.json, etc.)
"""

from pathlib import Path
from typing import Dict, Any
from templates.base_templates import ConfigTemplate


class PackageJsonTemplate(ConfigTemplate):
    """Template for package.json files."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        is_frontend = 'frontend' in str(file_path)
        
        if is_frontend:
            return self._generate_frontend_package()
        else:
            return self._generate_backend_package()
    
    def _generate_frontend_package(self) -> str:
        return """{
  "name": "beepmyphone-frontend",
  "version": "1.0.0",
  "description": "BeepMyPhone React frontend application",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "jest",
    "lint": "eslint src --ext ts,tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "@reduxjs/toolkit": "^1.9.0",
    "react-redux": "^8.0.0",
    "axios": "^1.3.0",
    "socket.io-client": "^4.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^5.16.0",
    "@testing-library/user-event": "^14.0.0",
    "@jest/globals": "^29.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^5.0.0",
    "@typescript-eslint/parser": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
"""
    
    def _generate_backend_package(self) -> str:
        return """{
  "name": "beepmyphone-backend",
  "version": "1.0.0",
  "description": "BeepMyPhone Node.js backend server",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src --ext ts",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "express": "^4.18.0",
    "socket.io": "^4.6.0",
    "sqlite3": "^5.1.0",
    "bcryptjs": "^2.4.0",
    "jsonwebtoken": "^9.0.0",
    "cors": "^2.8.0",
    "helmet": "^6.1.0",
    "express-rate-limit": "^6.7.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/node": "^18.15.0",
    "@types/bcryptjs": "^2.4.0",
    "@types/jsonwebtoken": "^9.0.0",
    "@types/cors": "^2.8.0",
    "@types/jest": "^29.5.0",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "typescript": "^5.0.0",
    "nodemon": "^3.0.0"
  }
}
"""


class TSConfigTemplate(ConfigTemplate):
    """Template for tsconfig.json files."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        is_frontend = 'frontend' in str(file_path)
        
        if is_frontend:
            return self._generate_frontend_tsconfig()
        else:
            return self._generate_backend_tsconfig()
    
    def _generate_frontend_tsconfig(self) -> str:
        return """{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ],
  "references": [{ "path": "./tsconfig.node.json" }]
}
"""
    
    def _generate_backend_tsconfig(self) -> str:
        return """{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
"""


class TSConfigNodeTemplate(ConfigTemplate):
    """Template for tsconfig.node.json files."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        return """{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
"""