#!/usr/bin/env python3

import re
from pathlib import Path

def debug_parse():
    structure_file = '/mnt/c/Projects/BeepMyPhone/backend/docs/PROJECT_STRUCTURE.md'
    
    with open(structure_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    
    # Find the app/ directory section
    in_app_section = False
    app_base_indent = None
    directory_stack = []
    
    print("=== Debugging Parser ===")
    
    for i, line in enumerate(lines):
        if not line.strip():
            continue
            
        # Look for app/ directory
        if '└── app/' in line or '├── app/' in line:
            in_app_section = True
            app_base_indent = len(line) - len(line.lstrip())
            directory_stack = []
            print(f"Line {i}: FOUND APP/ - base_indent={app_base_indent}")
            print(f"  Line: '{line}'")
            continue
            
        if not in_app_section:
            continue
            
        # Check if we've exited the app/ section
        if ('├──' in line or '└──' in line):
            current_indent = len(line) - len(line.lstrip())
            if current_indent <= app_base_indent:
                print(f"Line {i}: EXITING APP SECTION - indent={current_indent}")
                break
        
        # Only process tree structure lines
        if '├──' not in line and '└──' not in line:
            continue
            
        # Extract the item
        tree_match = re.search(r'[├└]──\s+(.+)', line)
        if not tree_match:
            continue
            
        item = tree_match.group(1).strip()
        
        # Remove comments
        if '#' in item:
            item = item.split('#')[0].strip()
            
        # Calculate proper depth by counting the tree characters in the line
        # Count "│   " and "    " patterns before the tree symbol
        prefix = line.split('├──')[0] if '├──' in line else line.split('└──')[0]
        
        # Count depth by number of tree levels
        # Each "│   " or "    " represents one level of nesting  
        depth = 0
        pos = 0
        while pos < len(prefix):
            if prefix[pos:pos+4] in ['│   ', '    ']:
                depth += 1
                pos += 4
            else:
                pos += 1
        
        print(f"Line {i}: '{item}' prefix='{repr(prefix)}' depth={depth}")
        
        # Adjust directory stack based on depth
        if item.endswith('/'):
            # It's a directory - truncate stack to correct depth and add directory
            directory_stack = directory_stack[:depth]
            dir_name = item.rstrip('/')
            directory_stack.append(dir_name)
            print(f"  → DIR '{dir_name}' stack={directory_stack}")
        else:
            # It's a file - use current directory stack truncated to proper depth
            if '.' in item and not item.startswith('.'):
                # Build full path using directory stack at current depth
                file_stack = directory_stack[:depth]
                
                if file_stack:
                    full_path = '/'.join(file_stack) + '/' + item
                else:
                    full_path = item
                
                print(f"  → FILE '{item}' file_stack={file_stack} path='{full_path}'")
        
        if i > 100:  # Only show first 100 lines for debugging
            break

if __name__ == '__main__':
    debug_parse()