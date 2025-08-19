#!/usr/bin/env python3
"""
Base template classes for the BeepMyPhone project generator.
"""

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Dict, Any


class BaseTemplate(ABC):
    """Base class for all file templates."""
    
    @abstractmethod
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        """Generate template content for the given file path and context."""
        pass
    
    def get_filename_from_path(self, file_path: Path) -> str:
        """Extract clean filename without extension."""
        return file_path.stem
    
    def get_class_name_from_filename(self, filename: str) -> str:
        """Convert filename to class name (PascalCase)."""
        # Remove .test, .spec suffixes
        clean_name = filename.replace('.test', '').replace('.spec', '')
        # Convert to PascalCase
        return ''.join(word.capitalize() for word in clean_name.split('_'))
    
    def get_relative_import_path(self, from_path: Path, to_path: Path) -> str:
        """Calculate relative import path between two files."""
        try:
            # Get directories
            from_dir = from_path.parent
            to_dir = to_path.parent
            
            # Calculate relative path
            rel_path = Path('..') / to_dir.relative_to(from_dir.parent)
            
            # Convert to import string
            import_path = str(rel_path / to_path.stem).replace('\\', '/').replace('/', '/')
            
            # Clean up the path
            if import_path.startswith('./'):
                import_path = import_path[2:]
            
            return import_path
        except Exception:
            # Fallback to absolute path within src
            return str(to_path.with_suffix('')).replace('\\', '/').replace('src/', '')


class ConfigTemplate(BaseTemplate):
    """Base class for configuration file templates."""
    pass


class CodeTemplate(BaseTemplate):
    """Base class for code file templates."""
    
    def get_imports_for_file_type(self, file_type: str, is_frontend: bool = True) -> list:
        """Get standard imports for different file types."""
        imports = []
        
        if file_type == 'component':
            imports.extend([
                "import React from 'react'"
            ])
        elif file_type == 'test':
            imports.extend([
                "import React from 'react'",
                "import { render, screen } from '@testing-library/react'"
            ])
        elif file_type == 'service':
            if is_frontend:
                imports.extend([
                    "import { BaseService } from '../base/BaseService'"
                ])
        
        return imports


class TestTemplate(CodeTemplate):
    """Template for test files with proper import path resolution."""
    
    def calculate_component_import(self, test_path: Path, component_name: str) -> str:
        """Calculate the correct import path from test to component."""
        # Example: src/tests/components/auth/Login.test.tsx -> ../../../components/auth/Login
        test_parts = test_path.parts
        
        if 'tests' in test_parts:
            tests_index = test_parts.index('tests')
            # Get the path after 'tests'
            relative_parts = test_parts[tests_index + 1:-1]  # exclude filename
            
            # Build relative path back to src, then to component
            dots = '../' * (len(relative_parts) + 1)  # +1 for tests dir itself
            component_path = dots + '/'.join(relative_parts) + f'/{component_name}'
            
            return component_path
        
        # Fallback
        return f'./{component_name}'