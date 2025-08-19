#!/usr/bin/env python3
"""
Template factory for generating different types of files.
"""

from pathlib import Path
from typing import Dict, Any, Optional
from templates.react_templates import (
    ReactComponentTemplate, ReactTestTemplate, ReactHookTemplate, 
    ServiceTemplate, BaseServiceTemplate
)
from templates.backend_templates import (
    ControllerTemplate, BaseControllerTemplate, BackendServiceTemplate,
    BackendBaseServiceTemplate, ModelTemplate, RepositoryTemplate
)
from templates.config_templates import (
    PackageJsonTemplate, TSConfigTemplate, TSConfigNodeTemplate
)
from templates.test_templates import (
    BackendTestTemplate, IntegrationTestTemplate, E2ETestTemplate, PerformanceTestTemplate
)
from templates.utility_templates import (
    UtilityTemplate, TypeDefinitionTemplate, ConstantsTemplate, 
    IndexTemplate, MiddlewareTemplate, RouteTemplate
)
from helpers.path_utils import get_project_type


class TemplateFactory:
    """Factory for creating appropriate templates based on file type and context."""
    
    def __init__(self):
        self.templates = {}
        self._register_templates()
    
    def _register_templates(self):
        """Register all available templates."""
        
        # React/Frontend templates
        self.templates['react_component'] = ReactComponentTemplate()
        self.templates['react_test'] = ReactTestTemplate()
        self.templates['react_hook'] = ReactHookTemplate()
        self.templates['frontend_service'] = ServiceTemplate()
        self.templates['frontend_base_service'] = BaseServiceTemplate()
        
        # Backend templates
        self.templates['controller'] = ControllerTemplate()
        self.templates['base_controller'] = BaseControllerTemplate()
        self.templates['backend_service'] = BackendServiceTemplate()
        self.templates['backend_base_service'] = BackendBaseServiceTemplate()
        self.templates['model'] = ModelTemplate()
        self.templates['repository'] = RepositoryTemplate()
        
        # Config templates
        self.templates['package_json'] = PackageJsonTemplate()
        self.templates['tsconfig'] = TSConfigTemplate()
        self.templates['tsconfig_node'] = TSConfigNodeTemplate()
        
        # Test templates
        self.templates['backend_test'] = BackendTestTemplate()
        self.templates['integration_test'] = IntegrationTestTemplate()
        self.templates['e2e_test'] = E2ETestTemplate()
        self.templates['performance_test'] = PerformanceTestTemplate()
        
        # Utility templates
        self.templates['utility'] = UtilityTemplate()
        self.templates['types'] = TypeDefinitionTemplate()
        self.templates['constants'] = ConstantsTemplate()
        self.templates['index'] = IndexTemplate()
        self.templates['middleware'] = MiddlewareTemplate()
        self.templates['route'] = RouteTemplate()
    
    def get_template(self, file_path: Path, file_type: str) -> Optional[object]:
        """
        Get the appropriate template for a file.
        
        Args:
            file_path: Path to the file being generated
            file_type: Type of file (from parser)
            
        Returns:
            Template instance or None
        """
        project_type = get_project_type(file_path)
        template_key = self._resolve_template_key(file_path, file_type, project_type)
        
        return self.templates.get(template_key)
    
    def _resolve_template_key(self, file_path: Path, file_type: str, project_type: str) -> str:
        """Resolve the correct template key based on context."""
        
        filename = file_path.name.lower()
        
        # Special cases for base classes
        if 'baseservice' in filename:
            if project_type == 'frontend':
                return 'frontend_base_service'
            else:
                return 'backend_base_service'
        elif 'basecontroller' in filename:
            return 'base_controller'
        
        # Configuration files
        elif file_type == 'package':
            return 'package_json'
        elif file_type == 'tsconfig':
            return 'tsconfig'
        elif file_type == 'tsconfig_node':
            return 'tsconfig_node'
        
        # Code files - differentiate by project type
        elif file_type == 'service':
            if project_type == 'frontend':
                return 'frontend_service'
            else:
                return 'backend_service'
        elif file_type == 'test':
            # Determine specific test type
            if 'integration' in filename:
                return 'integration_test'
            elif 'e2e' in filename:
                return 'e2e_test'
            elif 'performance' in filename or 'load' in filename:
                return 'performance_test'
            elif project_type == 'frontend':
                return 'react_test'
            else:
                return 'backend_test'
        elif file_type == 'component':
            return 'react_component'
        elif file_type == 'hook':
            return 'react_hook'
        elif file_type == 'controller':
            return 'controller'
        elif file_type == 'model':
            return 'model'
        elif file_type == 'repository':
            return 'repository'
        elif file_type == 'middleware':
            return 'middleware'
        elif file_type == 'route':
            return 'route'
        elif file_type == 'generic':
            # Try to determine more specific type
            if filename == 'index':
                return 'index'
            elif 'types' in filename or filename.endswith('types'):
                return 'types'
            elif 'constants' in filename or 'config' in filename:
                return 'constants'
            elif 'utils' in filename or 'helpers' in filename:
                return 'utility'
            else:
                return 'generic'
        
        # Fallback
        return 'generic'
    
    def generate_content(self, file_path: Path, file_type: str, context: Optional[Dict[str, Any]] = None) -> str:
        """
        Generate content for a file using the appropriate template.
        
        Args:
            file_path: Path to the file being generated
            file_type: Type of file
            context: Additional context for template generation
            
        Returns:
            Generated file content
        """
        if context is None:
            context = {}
        
        template = self.get_template(file_path, file_type)
        
        if template:
            return template.generate(file_path, context)
        else:
            # Fallback generic template
            return self._generate_generic_template(file_path, file_type)
    
    def _generate_generic_template(self, file_path: Path, file_type: str) -> str:
        """Generate a basic generic template."""
        filename = file_path.stem
        extension = file_path.suffix
        
        if extension == '.ts':
            return f"""// {filename}
// TODO: Implement {filename}

export class {filename.capitalize()} {{
  // TODO: Add implementation
}}

export default {filename.capitalize()}
"""
        elif extension == '.tsx':
            return f"""import React from 'react'

export const {filename.capitalize()} = () => {{
  return (
    <div>
      {{/* TODO: Implement {filename} component */}}
      <h1>{filename}</h1>
    </div>
  )
}}

export default {filename.capitalize()}
"""
        elif extension == '.json':
            return """{
  "TODO": "Add JSON configuration"
}
"""
        elif extension == '.css':
            return f"""/* {filename} */
/* TODO: Add CSS styles for {filename} */

.{filename.lower()} {{
  /* Add styles here */
}}
"""
        elif extension == '.sql':
            return f"""-- {filename}
-- TODO: Add SQL for {filename}

CREATE TABLE IF NOT EXISTS example (
  id INTEGER PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
"""
        else:
            return f"""# {filename}
# TODO: Implement {filename}
"""