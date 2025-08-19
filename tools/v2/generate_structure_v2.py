#!/usr/bin/env python3
"""
BeepMyPhone Project Structure Generator - Refactored Version

This tool reads PROJECT_STRUCTURE_SIMPLE.md files and creates placeholder files
for both frontend and backend projects based on the documented structure.
"""

import os
import argparse
from pathlib import Path
from typing import List, Tuple, Optional

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from helpers.file_parser import StructureParser, FileTypeDetector
from template_factory import TemplateFactory


class ProjectGenerator:
    """Main generator class that orchestrates file creation."""
    
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.parser = StructureParser(self.project_root)
        self.template_factory = TemplateFactory()
        self.created_files = []
        self.skipped_files = []
        
    def generate_project(self, project_type: str):
        """Generate files for a specific project type (frontend/backend)."""
        
        if project_type == 'frontend':
            self._generate_frontend()
        elif project_type == 'backend':
            self._generate_backend()
        elif project_type == 'all':
            self._generate_frontend()
            self._generate_backend()
        else:
            raise ValueError(f"Unknown project type: {project_type}")
    
    def _generate_frontend(self):
        """Generate frontend project structure."""
        print("\\n=== Generating Frontend Structure ===")
        
        structure_file = self.project_root / 'frontend' / 'docs' / 'PROJECT_STRUCTURE_SIMPLE.md'
        base_path = self.project_root / 'frontend' / 'app'
        
        self._generate_from_structure(structure_file, base_path)
    
    def _generate_backend(self):
        """Generate backend project structure."""
        print("\\n=== Generating Backend Structure ===")
        
        structure_file = self.project_root / 'backend' / 'docs' / 'PROJECT_STRUCTURE_SIMPLE.md'
        base_path = self.project_root / 'backend' / 'app'
        
        self._generate_from_structure(structure_file, base_path)
    
    def _generate_from_structure(self, structure_file: Path, base_path: Path):
        """Generate files from a structure file."""
        
        # Parse the structure file
        try:
            files = self.parser.parse_structure_file(structure_file)
            print(f"Using structure file: {structure_file}")
            print(f"Found {len(files)} files to create")
        except Exception as e:
            print(f"Error parsing structure file: {e}")
            return
        
        # Create each file
        for file_path, file_type in files:
            self._create_file(base_path, file_path, file_type)
    
    def _create_file(self, base_path: Path, relative_path: str, file_type: str):
        """Create a single file with appropriate template."""
        
        full_path = base_path / relative_path
        
        # Create directory if it doesn't exist
        full_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Skip if file already exists and is not empty
        if full_path.exists() and full_path.stat().st_size > 0:
            self.skipped_files.append(str(full_path))
            return
        
        # Generate content using template factory
        try:
            content = self.template_factory.generate_content(full_path, file_type)
            
            # Write file
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            self.created_files.append(str(full_path))
            print(f"Created: {relative_path}")
            
        except Exception as e:
            print(f"Error creating {relative_path}: {e}")
    
    def print_summary(self):
        """Print generation summary."""
        print(f"\\n=== Summary ===")
        print(f"Created: {len(self.created_files)} files")
        print(f"Skipped: {len(self.skipped_files)} files (already exist)")
        
        if self.created_files:
            print(f"\\nCreated files:")
            for file in self.created_files[:10]:  # Show first 10
                print(f"  {file}")
            if len(self.created_files) > 10:
                print(f"  ... and {len(self.created_files) - 10} more files")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Generate BeepMyPhone project structure')
    parser.add_argument('--backend', action='store_true', help='Generate backend structure')
    parser.add_argument('--frontend', action='store_true', help='Generate frontend structure')
    parser.add_argument('--all', action='store_true', help='Generate both frontend and backend')
    parser.add_argument('--project-root', default='.', help='Project root directory')
    
    args = parser.parse_args()
    
    # Determine what to generate
    if args.all:
        project_type = 'all'
    elif args.frontend:
        project_type = 'frontend'
    elif args.backend:
        project_type = 'backend'
    else:
        # Default to all if no specific option
        project_type = 'all'
    
    try:
        generator = ProjectGenerator(args.project_root)
        generator.generate_project(project_type)
        generator.print_summary()
        
    except Exception as e:
        print(f"Error: {e}")
        return 1
    
    return 0


if __name__ == '__main__':
    exit(main())