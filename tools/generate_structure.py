#!/usr/bin/env python3
"""
BeepMyPhone Project Structure Generator

This tool reads PROJECT_STRUCTURE.md files and creates placeholder files
for both frontend and backend projects based on the documented structure.
"""

import os
import re
import argparse
import subprocess
from pathlib import Path
from typing import Dict, List, Tuple, Optional

class ProjectStructureGenerator:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.created_files = []
        self.skipped_files = []
        
        # File extension templates
        self.templates = {
            '.ts': self._get_typescript_template,
            '.tsx': self._get_react_component_template,
            '.js': self._get_javascript_template,
            '.jsx': self._get_react_component_template,
            '.json': self._get_json_template,
            '.md': self._get_markdown_template,
            '.sql': self._get_sql_template,
            '.css': self._get_css_template,
            '.html': self._get_html_template,
            '.sh': self._get_shell_template,
            '.yml': self._get_yaml_template,
            '.yaml': self._get_yaml_template,
        }

    def parse_project_structure(self, structure_file: str) -> List[Tuple[str, str]]:
        """Parse PROJECT_STRUCTURE.md and extract file paths and types."""
        structure_path = Path(structure_file)
        
        # First try to find the simple format file
        simple_structure_path = structure_path.parent / 'PROJECT_STRUCTURE_SIMPLE.md'
        if simple_structure_path.exists():
            print(f"Using simple format: {simple_structure_path}")
            with open(simple_structure_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return self._parse_simple_format(content)
        
        # Fallback to original structure file
        if not structure_path.exists():
            raise FileNotFoundError(f"Structure file not found: {structure_file}")
        
        with open(structure_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Look for a simple FILE_LIST section in markdown
        if '## FILE_LIST' in content:
            # Use simple path-based format
            return self._parse_simple_format(content)
        else:
            # Try to parse the tree format (fallback)
            return self._parse_tree_format(content)
    
    def _parse_simple_format(self, content: str) -> List[Tuple[str, str]]:
        """Parse simple path-based file list format."""
        files = []
        lines = content.split('\n')
        
        in_file_list = False
        for line in lines:
            line = line.strip()
            
            if '## FILE_LIST' in line:
                in_file_list = True
                continue
                
            if not in_file_list or not line:
                continue
                
            # Skip section headers (### comments)
            if line.startswith('#'):
                continue
                
            # Skip markdown formatting
            if line.startswith('- ') or line.startswith('* '):
                line = line[2:].strip()
            
            # Remove comments
            if '#' in line:
                line = line.split('#')[0].strip()
                
            # Only process lines that look like file paths
            if '/' not in line and '.' not in line:
                continue
                
            # Skip unwanted files
            filename = line.split('/')[-1]
            skip_items = {
                'README.md', 'package-lock.json', '.env', '.env.example', 
                '.gitignore', '.eslintrc.js', '.prettierrc'
            }
            
            if filename in skip_items:
                continue
                
            if '.' in filename and not filename.startswith('.'):
                file_type = self._determine_file_type(filename)
                files.append((line, file_type))
                print(f"Added file: {line} (type: {file_type})")
        
        return files
    
    def _parse_tree_format(self, content: str) -> List[Tuple[str, str]]:
        """Parse tree format - simplified approach focusing on known patterns."""
        files = []
        lines = content.split('\n')
        
        # Simply extract all .ts, .tsx, .js, .json files from the tree
        for line in lines:
            # Look for files with extensions in tree format
            tree_match = re.search(r'[├└│]\s*──\s*([a-zA-Z0-9_.-]+\.[a-zA-Z]+)', line)
            if tree_match:
                filename = tree_match.group(1)
                
                # Skip unwanted files
                skip_items = {
                    'README.md', 'package-lock.json', '.env', '.env.example', 
                    '.gitignore', '.eslintrc.js', '.prettierrc', 'jest.config.js'
                }
                
                if filename in skip_items:
                    continue
                
                # Try to determine path context from previous lines
                full_path = self._guess_file_path(lines, line, filename)
                file_type = self._determine_file_type(filename)
                files.append((full_path, file_type))
        
        return files
    
    def _guess_file_path(self, all_lines: List[str], current_line: str, filename: str) -> str:
        """Guess the full path of a file based on context."""
        # For now, return just the filename - we'll improve this if needed
        # The key insight is that most files should be in src/ subdirectories
        
        # Common patterns - put TypeScript files in appropriate directories
        if filename.endswith('.ts') or filename.endswith('.tsx'):
            if 'Controller' in filename:
                return f'src/controllers/{filename}'
            elif 'Service' in filename:
                return f'src/services/{filename}'
            elif 'Model' in filename or 'Entity' in filename:
                return f'src/models/{filename}'
            elif filename in ['index.ts', 'app.ts', 'server.ts']:
                return f'src/{filename}'
            elif 'test' in filename.lower() or 'spec' in filename.lower():
                return f'tests/{filename}'
            else:
                return f'src/{filename}'
        elif filename == 'package.json':
            return filename
        elif filename == 'tsconfig.json':
            return filename
        elif filename == 'tsconfig.node.json':
            return filename
        else:
            return filename

    def _determine_file_type(self, filename: str) -> str:
        """Determine the file type based on filename and path."""
        ext = Path(filename).suffix.lower()
        name = Path(filename).stem.lower()
        
        # Special cases
        if filename == 'package.json':
            return 'package'
        elif filename == 'tsconfig.json':
            return 'tsconfig'
        elif filename == 'tsconfig.node.json':
            return 'tsconfig_node'
        elif filename == 'vite.config.ts':
            return 'vite_config'
        elif filename == 'jest.config.js':
            return 'jest_config'
        elif '.test.' in filename or '.spec.' in filename:
            return 'test'
        elif name.endswith('controller'):
            return 'controller'
        elif name.endswith('service'):
            return 'service'
        elif name.endswith('repository'):
            return 'repository'
        elif name.endswith('model'):
            return 'model'
        elif name.endswith('component') or ext == '.tsx':
            return 'component'
        elif name.endswith('hook') or name.startswith('use'):
            return 'hook'
        elif 'middleware' in name:
            return 'middleware'
        elif 'route' in name:
            return 'route'
        elif ext == '.sql':
            return 'migration'
        else:
            return 'generic'

    def create_file_structure(self, files: List[Tuple[str, str]], base_path: str):
        """Create all files with appropriate templates."""
        base_path = Path(base_path)
        
        for file_path, file_type in files:
            full_path = base_path / file_path
            
            # Create directory if it doesn't exist
            full_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Skip if file already exists and is not empty
            if full_path.exists() and full_path.stat().st_size > 0:
                self.skipped_files.append(str(full_path))
                continue
            
            # Get template content
            content = self._get_template_content(full_path, file_type)
            
            # Write file
            try:
                with open(full_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                self.created_files.append(str(full_path))
                print(f"Created: {file_path}")
            except Exception as e:
                print(f"Error creating {file_path}: {e}")

    def _get_template_content(self, file_path: Path, file_type: str) -> str:
        """Get appropriate template content for the file."""
        ext = file_path.suffix.lower()
        
        if ext in self.templates:
            return self.templates[ext](file_path, file_type)
        else:
            return self._get_generic_template(file_path, file_type)

    def _get_typescript_template(self, file_path: Path, file_type: str) -> str:
        """Generate TypeScript template."""
        name = file_path.stem
        
        if file_type == 'controller':
            if name == 'BaseController':
                return f"""import {{ Request, Response }} from 'express'

export abstract class BaseController {{
  // TODO: Implement base controller methods
  
  protected sendResponse(res: Response, data: any, statusCode: number = 200) {{
    res.status(statusCode).json(data)
  }}
  
  protected sendError(res: Response, message: string, statusCode: number = 500) {{
    res.status(statusCode).json({{ error: message }})
  }}
}}
"""
            else:
                return f"""import {{ Request, Response }} from 'express'
import {{ BaseController }} from './base/BaseController'

export class {name} extends BaseController {{
  // TODO: Implement {name} methods
  
  async index(req: Request, res: Response) {{
    try {{
      // TODO: Implement index method
      this.sendResponse(res, {{ message: '{name} index' }})
    }} catch (error) {{
      this.sendError(res, `Error in {name}: ${{error}}`)
    }}
  }}
}}
"""
        elif file_type == 'service':
            if name == 'BaseService':
                return f"""export abstract class BaseService {{
  // TODO: Implement base service methods
  
  protected validateInput(input: any): boolean {{
    // TODO: Add validation logic
    return input !== null && input !== undefined
  }}
  
  protected handleError(error: any): never {{
    console.error('Service error:', error)
    throw new Error(`Service error: ${{error}}`)
  }}
}}
"""
            else:
                return f"""import {{ BaseService }} from './base/BaseService'

export class {name} extends BaseService {{
  // TODO: Implement {name} methods
  
  async process(data: any): Promise<any> {{
    try {{
      if (!this.validateInput(data)) {{
        throw new Error('Invalid input data')
      }}
      // TODO: Implement processing logic
      return {{ success: true, data }}
    }} catch (error) {{
      this.handleError(error)
    }}
  }}
}}
"""
        elif file_type == 'model':
            return f"""export interface {name} {{
  id: string
  createdAt: Date
  updatedAt: Date
  // TODO: Add {name} properties
}}

export class {name}Entity implements {name} {{
  id: string = ''
  createdAt: Date = new Date()
  updatedAt: Date = new Date()
  
  // TODO: Implement {name}Entity
}}
"""
        elif file_type == 'repository':
            if name == 'BaseRepository':
                return f"""export abstract class BaseRepository<T> {{
  // TODO: Implement base repository methods
  
  abstract findById(id: string): Promise<T | null>
  abstract findAll(): Promise<T[]>
  abstract create(entity: Partial<T>): Promise<T>
  abstract update(id: string, entity: Partial<T>): Promise<T>
  abstract delete(id: string): Promise<boolean>
  
  protected validateId(id: string): boolean {{
    return typeof id === 'string' && id.length > 0
  }}
}}
"""
            else:
                return f"""import {{ BaseRepository }} from './base/BaseRepository'

export class {name} extends BaseRepository<any> {{
  // TODO: Implement {name} methods
  
  async findById(id: string): Promise<any | null> {{
    if (!this.validateId(id)) return null
    // TODO: Implement findById logic
    return {{ id, name: '{name} item' }}
  }}
  
  async findAll(): Promise<any[]> {{
    // TODO: Implement findAll logic
    return []
  }}
  
  async create(entity: any): Promise<any> {{
    // TODO: Implement create logic
    return {{ id: 'new-id', ...entity }}
  }}
  
  async update(id: string, entity: any): Promise<any> {{
    // TODO: Implement update logic
    return {{ id, ...entity }}
  }}
  
  async delete(id: string): Promise<boolean> {{
    // TODO: Implement delete logic
    return true
  }}
}}
"""
        elif file_type == 'middleware':
            return f"""import {{ Request, Response, NextFunction }} from 'express'

export const {name.lower()} = (req: Request, res: Response, next: NextFunction) => {{
  // TODO: Implement {name} middleware
  next()
}}
"""
        elif file_type == 'route':
            return f"""import {{ Router }} from 'express'

const router = Router()

// TODO: Implement {name} routes

export {{ router as {name.replace('Routes', '').lower()}Routes }}
"""
        elif file_type == 'test':
            return f"""import {{ describe, it, expect, beforeEach, afterEach }} from '@jest/globals'

describe('{name}', () => {{
  beforeEach(() => {{
    // TODO: Setup test environment
  }})
  
  afterEach(() => {{
    // TODO: Cleanup test environment
  }})
  
  it('should implement test cases', () => {{
    // TODO: Add test cases
    expect(true).toBe(true)
  }})
}})
"""
        elif file_type == 'vite_config':
            return """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
"""
        else:
            return f"""// {name}
// TODO: Implement {name}

export const {name.replace('.', '_')} = {{
  // Add implementation here
}}
"""

    def _get_react_component_template(self, file_path: Path, file_type: str) -> str:
        """Generate React component template."""
        name = file_path.stem
        
        if file_type == 'test':
            component_name = name.replace('.test', '')
            # Calculate correct import path for test files
            import_path = self._calculate_test_import_path(file_path, component_name)
            return f"""import {{ render }} from '@testing-library/react'
import {{ {component_name} }} from '{import_path}'

describe('{component_name}', () => {{
  it('renders correctly', () => {{
    render(<{component_name} />)
    // TODO: Add test assertions
  }})
}})
"""
        elif name == 'main':
            return """import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)"""
        elif name == 'App':
            return """import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'

interface AppProps {
  // TODO: Define component props if needed
}

export const App: React.FC<AppProps> = () => {
  return (
    <Router>
      <div className="app">
        {/* TODO: Implement App component */}
        <h1>BeepMyPhone</h1>
      </div>
    </Router>
  )
}

export default App"""
        else:
            return f"""import React from 'react'

interface {name}Props {{
  // TODO: Define component props
}}

export const {name}: React.FC<{name}Props> = () => {{
  return (
    <div>
      {{/* TODO: Implement {name} component */}}
      <h1>{name}</h1>
    </div>
  )
}}
"""

    def _get_javascript_template(self, file_path: Path, file_type: str) -> str:
        """Generate JavaScript template."""
        name = file_path.stem
        
        if name == 'jest.config':
            return """module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.(ts|js)', '**/*.(test|spec).(ts|js)'],
  transform: {
    '^.+\\\\.(ts|tsx)$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.(ts|js)',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
}
"""
        else:
            return f"""// {name}
// TODO: Implement {name}

module.exports = {{
  // Add implementation here
}}
"""

    def _get_json_template(self, file_path: Path, file_type: str) -> str:
        """Generate JSON template."""
        name = file_path.stem
        
        if name == 'package':
            if 'frontend' in str(file_path):
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
            else:
                return """{
  "name": "beepmyphone-backend",
  "version": "1.0.0",
  "description": "BeepMyPhone Node.js backend application",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src --ext ts",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "nodemon": "^3.0.0"
  }
}
"""
        elif name == 'tsconfig':
            if 'frontend' in str(file_path):
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
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "types": ["vite/client", "@types/node"]
  },
  "include": [
    "src"
  ],
  "references": [{ "path": "./tsconfig.node.json" }]
}
"""
            else:
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
    "sourceMap": true,
    "moduleResolution": "node",
    "types": ["node", "jest"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
"""
        elif file_type == 'tsconfig_node':
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
        else:
            return """{
  "TODO": "Add JSON configuration"
}
"""

    def _get_markdown_template(self, file_path: Path, file_type: str) -> str:
        """Generate Markdown template."""
        name = file_path.stem
        return f"""# {name}

TODO: Add documentation for {name}

## Overview

Describe the purpose and functionality of {name}.

## Usage

Provide usage examples and instructions.
"""

    def _get_sql_template(self, file_path: Path, file_type: str) -> str:
        """Generate SQL template."""
        name = file_path.stem
        return f"""-- {name}
-- TODO: Implement database migration

-- Migration script for {name}
-- Add SQL statements here
"""

    def _get_css_template(self, file_path: Path, file_type: str) -> str:
        """Generate CSS template."""
        name = file_path.stem
        class_name = name.replace('_', '-')
        return f"""/* {name} */
/* TODO: Add CSS styles for {name} */

.{class_name} {{
  /* Add styles here */
}}
"""

    def _get_html_template(self, file_path: Path, file_type: str) -> str:
        """Generate HTML template."""
        name = file_path.stem
        
        if name == 'index' and 'frontend' in str(file_path):
            return """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BeepMyPhone</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
"""
        else:
            return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{name}</title>
</head>
<body>
    <!-- TODO: Add HTML content for {name} -->
    <h1>{name}</h1>
</body>
</html>
"""

    def _calculate_test_import_path(self, test_file_path: Path, component_name: str) -> str:
        """Calculate the correct import path from test file to component."""
        path_parts = test_file_path.parts
        
        if 'tests' in path_parts:
            tests_index = path_parts.index('tests')
            # Get path after 'tests' - skip 'unit' if present
            after_tests = list(path_parts[tests_index + 1:-1])  # exclude filename
            if after_tests and after_tests[0] == 'unit':
                after_tests = after_tests[1:]  # Remove 'unit' from path
            
            if after_tests:
                # tests/unit/components/layout/AppLayout.test.tsx -> ../../../../components/layout/AppLayout
                dots = '../' * (len(path_parts) - tests_index - 1)  # Number of directories to go up
                component_path = f"{dots}{'/'.join(after_tests)}/{component_name}"
                return component_path
        
        # Fallback to current directory
        return f"./{component_name}"
    
    def _get_shell_template(self, file_path: Path, file_type: str) -> str:
        """Generate Shell script template."""
        name = file_path.stem
        return f"""#!/bin/bash

# {name}
# TODO: Implement shell script for {name}

set -euo pipefail

echo "Running {name}..."

# Add script implementation here
"""

    def _get_yaml_template(self, file_path: Path, file_type: str) -> str:
        """Generate YAML template."""
        name = file_path.stem
        return f"""# {name}
# TODO: Add YAML configuration for {name}

name: {name}
version: "1.0.0"

# Add YAML configuration here
"""

    def _get_generic_template(self, file_path: Path, file_type: str) -> str:
        """Generate generic template for unknown file types."""
        name = file_path.stem
        ext = file_path.suffix
        
        return f"""# {name}{ext}
# TODO: Implement {name}

# File: {file_path}
# Type: {file_type}
# Generated automatically by BeepMyPhone project structure generator
"""

    def scaffold_react_project(self, target_dir: Path) -> bool:
        """Create React project using Vite scaffolding."""
        print(f"Scaffolding React project in {target_dir}")
        
        # Check if already scaffolded
        if (target_dir / 'package.json').exists() and (target_dir / 'src' / 'main.tsx').exists():
            print("React project already scaffolded, skipping...")
            return True
            
        try:
            # Create parent directory if it doesn't exist
            target_dir.parent.mkdir(parents=True, exist_ok=True)
            
            # Run Vite create command
            result = subprocess.run([
                'npm', 'create', 'vite@latest', str(target_dir.name), 
                '--', '--template', 'react-ts'
            ], cwd=target_dir.parent, capture_output=True, text=True, check=True)
            
            print("React scaffolding completed successfully")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"Failed to scaffold React project: {e}")
            print(f"stdout: {e.stdout}")
            print(f"stderr: {e.stderr}")
            return False

    def should_skip_file(self, file_path: str, project_type: str) -> bool:
        """Determine if file should be skipped (handled by scaffolding)."""
        # Files that React/Vite scaffolding creates
        react_scaffold_files = {
            'package.json', 'vite.config.ts', 'tsconfig.json', 'tsconfig.node.json',
            'src/main.tsx', 'src/App.tsx', 'index.html', 'public/vite.svg', 'src/vite-env.d.ts'
        }
        
        if project_type == 'frontend' and file_path in react_scaffold_files:
            return True
            
        return False

def main():
    parser = argparse.ArgumentParser(description='Generate BeepMyPhone project structure')
    parser.add_argument('--backend', action='store_true', help='Generate backend structure')
    parser.add_argument('--frontend', action='store_true', help='Generate frontend structure')
    parser.add_argument('--all', action='store_true', help='Generate both frontend and backend')
    parser.add_argument('--project-root', default='.', help='Project root directory')
    
    args = parser.parse_args()
    
    if not any([args.backend, args.frontend, args.all]):
        print("Please specify --backend, --frontend, or --all")
        return
    
    project_root = Path(args.project_root).resolve()
    generator = ProjectStructureGenerator(str(project_root))
    
    try:
        if args.backend or args.all:
            print("\\n=== Generating Backend Structure ===")
            backend_structure = project_root / 'backend' / 'docs' / 'PROJECT_STRUCTURE.md'
            backend_base = project_root / 'backend' / 'app'
            
            files = generator.parse_project_structure(str(backend_structure))
            print(f"Found {len(files)} files to create for backend")
            generator.create_file_structure(files, str(backend_base))
        
        if args.frontend or args.all:
            print("\\n=== Generating Frontend Structure ===")
            frontend_structure = project_root / 'frontend' / 'docs' / 'PROJECT_STRUCTURE.md'
            frontend_base = project_root / 'frontend' / 'app'
            
            # Step 1: Scaffold React project
            if generator.scaffold_react_project(frontend_base):
                # Step 2: Generate domain-specific files
                files = generator.parse_project_structure(str(frontend_structure))
                print(f"Found {len(files)} files to create for frontend")
                
                # Filter out files handled by scaffolding
                domain_files = [(path, type_) for path, type_ in files 
                               if not generator.should_skip_file(path, 'frontend')]
                print(f"Generating {len(domain_files)} domain-specific files (skipping {len(files) - len(domain_files)} scaffold files)")
                
                generator.create_file_structure(domain_files, str(frontend_base))
            else:
                print("Failed to scaffold React project, skipping frontend generation")
        
        print(f"\\n=== Summary ===")
        print(f"Created: {len(generator.created_files)} files")
        print(f"Skipped: {len(generator.skipped_files)} files (already exist)")
        
        if generator.created_files:
            print(f"\\nCreated files:")
            for file in generator.created_files[:10]:  # Show first 10
                print(f"  {file}")
            if len(generator.created_files) > 10:
                print(f"  ... and {len(generator.created_files) - 10} more files")
                
    except Exception as e:
        print(f"Error: {e}")
        return 1
    
    return 0

if __name__ == '__main__':
    exit(main())