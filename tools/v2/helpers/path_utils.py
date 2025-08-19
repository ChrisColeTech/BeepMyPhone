#!/usr/bin/env python3
"""
Path utilities for the project generator.
"""

from pathlib import Path
from typing import Tuple


def calculate_relative_import(from_path: Path, to_path: Path) -> str:
    """
    Calculate relative import path from one file to another.
    
    Args:
        from_path: Source file path (e.g., src/tests/components/auth/Login.test.tsx)
        to_path: Target file path (e.g., src/components/auth/Login.tsx)
    
    Returns:
        Relative import path (e.g., '../../../components/auth/Login')
    """
    try:
        # Get the directories containing each file
        from_dir = from_path.parent
        to_dir = to_path.parent
        
        # Find common ancestor
        common_parts = []
        from_parts = list(from_dir.parts)
        to_parts = list(to_dir.parts)
        
        # Find src directory as reference point
        src_index_from = None
        src_index_to = None
        
        for i, part in enumerate(from_parts):
            if part == 'src':
                src_index_from = i
                break
                
        for i, part in enumerate(to_parts):
            if part == 'src':
                src_index_to = i
                break
        
        if src_index_from is None or src_index_to is None:
            # Fallback to simple relative path
            return str(to_path.with_suffix('')).replace('\\', '/')
        
        # Get paths relative to src
        from_rel = from_parts[src_index_from + 1:]  # exclude src itself
        to_rel = to_parts[src_index_to + 1:]       # exclude src itself
        
        # Calculate how many directories to go up
        up_levels = len(from_rel)
        
        # Build relative path
        up_path = '../' * up_levels
        down_path = '/'.join(to_rel)
        file_name = to_path.stem  # without extension
        
        result = f"{up_path}{down_path}/{file_name}"
        
        # Clean up the path
        result = result.replace('//', '/').rstrip('/')
        
        return result
        
    except Exception as e:
        # Fallback: return simple path
        return f"./{to_path.stem}"


def determine_file_category(file_path: Path) -> Tuple[str, str]:
    """
    Determine the category and type of a file based on its path and name.
    
    Returns:
        Tuple of (category, file_type)
        category: 'component', 'service', 'test', 'config', etc.
        file_type: 'tsx', 'ts', 'json', etc.
    """
    path_str = str(file_path).lower()
    filename = file_path.name.lower()
    
    # Determine file type from extension
    extension = file_path.suffix.lower()
    
    # Determine category from path and filename
    if 'test' in filename or '/tests/' in path_str:
        category = 'test'
    elif '/components/' in path_str:
        category = 'component'
    elif '/services/' in path_str:
        category = 'service'
    elif '/hooks/' in path_str:
        category = 'hook'
    elif '/pages/' in path_str:
        category = 'page'
    elif '/utils/' in path_str:
        category = 'utility'
    elif filename in ['package.json', 'tsconfig.json', 'tsconfig.node.json']:
        category = 'config'
    elif '/controllers/' in path_str:
        category = 'controller'
    elif '/models/' in path_str:
        category = 'model'
    elif '/middleware/' in path_str:
        category = 'middleware'
    else:
        category = 'generic'
    
    return category, extension


def get_project_type(file_path: Path) -> str:
    """Determine if file belongs to frontend, backend, or other."""
    path_str = str(file_path).lower()
    
    if '/frontend/' in path_str:
        return 'frontend'
    elif '/backend/' in path_str:
        return 'backend'
    elif '/electron/' in path_str:
        return 'electron'
    else:
        return 'unknown'


def normalize_filename(filename: str) -> str:
    """Normalize filename for class/function names."""
    # Remove extensions and test suffixes
    clean = filename.replace('.test', '').replace('.spec', '')
    clean = clean.split('.')[0]  # Remove all extensions
    
    # Convert to PascalCase for class names
    return ''.join(word.capitalize() for word in clean.split('_'))


def get_import_alias(file_path: Path) -> str:
    """Get appropriate import alias for a file."""
    filename = file_path.stem
    
    # Special cases
    if filename == 'index':
        # Use parent directory name
        return file_path.parent.name
    
    return normalize_filename(filename)