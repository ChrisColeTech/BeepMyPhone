# BeepMyPhone Development Tools

This directory contains tools for BeepMyPhone project development.

## generate_structure.py

A Python tool that reads PROJECT_STRUCTURE.md files and generates placeholder files for the entire project structure.

### Usage

```bash
# Generate backend structure only
python tools/generate_structure.py --backend --project-root .

# Generate frontend structure only  
python tools/generate_structure.py --frontend --project-root .

# Generate both frontend and backend
python tools/generate_structure.py --all --project-root .
```

### Features

- Reads PROJECT_STRUCTURE.md documents from both frontend and backend
- Creates appropriate file templates based on file type and context
- Supports TypeScript, React, JSON, SQL, CSS, HTML, Shell, and other file types
- Skips existing files to avoid overwriting work
- Provides comprehensive file templates with proper imports and structure

### File Templates

The tool generates intelligent templates for:
- **Controllers**: Express.js controllers with proper inheritance
- **Services**: Business logic services with error handling
- **Models**: TypeScript interfaces and classes
- **Components**: React functional components with TypeScript
- **Tests**: Jest test files with proper structure
- **Configuration**: Package.json, tsconfig.json, etc.
- **And many more...**

This tool ensures that the entire project structure follows the documented architecture and maintains consistency across all generated files.