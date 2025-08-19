#!/usr/bin/env python3
"""
React/TypeScript templates for frontend components and tests.
"""

from pathlib import Path
from typing import Dict, Any
from templates.base_templates import CodeTemplate, TestTemplate


class ReactComponentTemplate(CodeTemplate):
    """Template for React components."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        component_name = self.get_class_name_from_filename(file_path.stem)
        
        return f"""import React from 'react'

interface {component_name}Props {{
  // TODO: Define component props
}}

export const {component_name}: React.FC<{component_name}Props> = (props) => {{
  return (
    <div className="{component_name.lower()}">
      {{/* TODO: Implement {component_name} component */}}
      <h1>{component_name}</h1>
    </div>
  )
}}

export default {component_name}
"""


class ReactTestTemplate(TestTemplate):
    """Template for React component tests with correct import paths."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        # Get component name (remove .test from filename)
        component_name = self.get_class_name_from_filename(file_path.stem.replace('.test', ''))
        
        # Calculate correct import path
        import_path = self.calculate_component_import(file_path, component_name)
        
        return f"""import React from 'react'
import {{ render, screen }} from '@testing-library/react'
import {{ {component_name} }} from '{import_path}'

describe('{component_name}', () => {{
  it('renders correctly', () => {{
    render(<{component_name} />)
    // TODO: Add test assertions
    expect(screen.getByText('{component_name}')).toBeInTheDocument()
  }})
  
  it('handles props correctly', () => {{
    // TODO: Test component props
  }})
}})
"""


class ReactHookTemplate(CodeTemplate):
    """Template for custom React hooks."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        hook_name = file_path.stem  # e.g., useAuth
        
        return f"""import {{ useState, useEffect }} from 'react'

interface {hook_name.capitalize()}Return {{
  // TODO: Define hook return type
  data: any
  loading: boolean
  error: string | null
}}

export const {hook_name} = (): {hook_name.capitalize()}Return => {{
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {{
    // TODO: Implement hook logic
  }}, [])
  
  return {{
    data,
    loading,
    error
  }}
}}

export default {hook_name}
"""


class ServiceTemplate(CodeTemplate):
    """Template for frontend service classes."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        service_name = self.get_class_name_from_filename(file_path.stem)
        
        return f"""import {{ BaseService }} from '../base/BaseService'

export class {service_name} extends BaseService {{
  // TODO: Implement {service_name} methods
  
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
  
  // TODO: Add specific service methods
}}

export default new {service_name}()
"""


class BaseServiceTemplate(CodeTemplate):
    """Template for the base service class."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        return """export abstract class BaseService {
  // TODO: Implement base service methods
  
  protected validateInput(input: any): boolean {
    // TODO: Add validation logic
    return input !== null && input !== undefined
  }
  
  protected handleError(error: any): never {
    console.error('Service error:', error)
    throw new Error(`Service error: ${error}`)
  }
  
  protected async makeRequest<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      this.handleError(error)
    }
  }
}
"""