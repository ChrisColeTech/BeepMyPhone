#!/usr/bin/env python3
"""
File parser utilities for reading project structure files.
"""

from pathlib import Path
from typing import List, Tuple
import re


class StructureParser:
    """Parser for PROJECT_STRUCTURE_SIMPLE.md files."""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
    
    def parse_structure_file(self, structure_file: Path) -> List[Tuple[str, str]]:
        """
        Parse a PROJECT_STRUCTURE_SIMPLE.md file and return list of (file_path, file_type).
        
        Returns:
            List of tuples: (relative_file_path, file_type)
        """
        files = []
        
        if not structure_file.exists():
            raise FileNotFoundError(f"Structure file not found: {structure_file}")
        
        with open(structure_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Split into lines and process each line
        lines = content.strip().split('\\n')
        
        for line in lines:
            line = line.strip()
            
            # Skip empty lines, comments, and headers
            if not line or line.startswith('#') or line.startswith('This document'):
                continue
            
            # Skip section headers
            if line.startswith('###') or line.startswith('##'):
                continue
            
            # Skip lines that don't look like file paths
            if '/' not in line and '.' not in line:
                continue
            
            # Clean up the line (remove any markdown formatting)
            file_path = line.strip()
            
            # Skip if it looks like a directory (ends with /)
            if file_path.endswith('/'):
                continue
            
            # Determine file type from the path and extension
            file_type = self._determine_file_type(file_path)
            
            files.append((file_path, file_type))
        
        return files
    
    def _determine_file_type(self, file_path: str) -> str:
        """Determine the type of file based on path and extension."""
        path_lower = file_path.lower()
        filename = Path(file_path).name.lower()
        
        # Special configuration files
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
        elif filename == 'tailwind.config.js':
            return 'tailwind_config'
        
        # Determine by path location
        elif '/tests/' in path_lower or '.test.' in filename or '.spec.' in filename:
            return 'test'
        elif '/components/' in path_lower and filename.endswith('.tsx'):
            return 'component'
        elif '/services/' in path_lower:
            if 'baseservice' in filename:
                return 'base_service'
            else:
                return 'service'
        elif '/hooks/' in path_lower:
            return 'hook'
        elif '/pages/' in path_lower:
            return 'page'
        elif '/controllers/' in path_lower:
            if 'basecontroller' in filename:
                return 'base_controller'
            else:
                return 'controller'
        elif '/models/' in path_lower:
            if 'basemodel' in filename:
                return 'base_model'
            else:
                return 'model'
        elif '/repositories/' in path_lower:
            if 'baserepository' in filename:
                return 'base_repository'
            else:
                return 'repository'
        elif '/middleware/' in path_lower:
            return 'middleware'
        elif '/routes/' in path_lower:
            return 'route'
        elif '.sql' in filename:
            return 'migration'
        
        # Fallback to generic
        else:
            return 'generic'


class FileTypeDetector:
    """Detects file types and categories for template selection."""
    
    @staticmethod
    def get_template_type(file_path: str, file_type: str) -> str:
        """
        Get the specific template type needed for a file.
        
        Args:
            file_path: Relative path to the file
            file_type: Basic file type from parser
            
        Returns:
            Specific template type string
        """
        path_lower = file_path.lower()
        
        # Map file types to template types
        type_mapping = {
            'package': 'package_json',
            'tsconfig': 'tsconfig',
            'tsconfig_node': 'tsconfig_node',
            'vite_config': 'vite_config',
            'jest_config': 'jest_config',
            'component': 'react_component',
            'test': 'react_test',
            'service': 'service',
            'base_service': 'base_service',
            'hook': 'react_hook',
            'page': 'react_component',  # Pages are components
            'controller': 'controller',
            'base_controller': 'base_controller',
            'model': 'model',
            'repository': 'repository',
            'middleware': 'middleware',
            'route': 'route',
            'migration': 'sql',
            'generic': 'generic'
        }
        
        return type_mapping.get(file_type, 'generic')
    
    @staticmethod
    def needs_special_handling(file_path: str, file_type: str) -> bool:
        """Check if file needs special template handling."""
        special_files = [
            'package.json',
            'tsconfig.json', 
            'tsconfig.node.json',
            'baseservice.ts',
            'basecontroller.ts',
            'basemodel.ts'
        ]
        
        filename = Path(file_path).name.lower()
        return filename in special_files or file_type in ['base_service', 'base_controller', 'base_model']