#!/usr/bin/env python3
"""
Backend/Node.js templates for controllers, services, models, etc.
"""

from pathlib import Path
from typing import Dict, Any
from templates.base_templates import CodeTemplate


class ControllerTemplate(CodeTemplate):
    """Template for Express controllers."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        controller_name = self.get_class_name_from_filename(file_path.stem)
        
        return f"""import {{ Request, Response }} from 'express'
import {{ BaseController }} from './base/BaseController'

export class {controller_name} extends BaseController {{
  // TODO: Implement {controller_name} methods
  
  async index(req: Request, res: Response) {{
    try {{
      // TODO: Implement index method
      this.sendResponse(res, {{ message: '{controller_name} index' }})
    }} catch (error) {{
      this.sendError(res, `Error in {controller_name}: ${{error}}`)
    }}
  }}
  
  async show(req: Request, res: Response) {{
    try {{
      const id = req.params.id
      // TODO: Implement show method
      this.sendResponse(res, {{ message: `{controller_name} show: ${{id}}` }})
    }} catch (error) {{
      this.sendError(res, `Error in {controller_name}: ${{error}}`)
    }}
  }}
  
  async create(req: Request, res: Response) {{
    try {{
      const data = req.body
      // TODO: Implement create method
      this.sendResponse(res, {{ message: '{controller_name} created', data }}, 201)
    }} catch (error) {{
      this.sendError(res, `Error in {controller_name}: ${{error}}`)
    }}
  }}
  
  async update(req: Request, res: Response) {{
    try {{
      const id = req.params.id
      const data = req.body
      // TODO: Implement update method
      this.sendResponse(res, {{ message: `{controller_name} updated: ${{id}}`, data }})
    }} catch (error) {{
      this.sendError(res, `Error in {controller_name}: ${{error}}`)
    }}
  }}
  
  async delete(req: Request, res: Response) {{
    try {{
      const id = req.params.id
      // TODO: Implement delete method
      this.sendResponse(res, {{ message: `{controller_name} deleted: ${{id}}` }})
    }} catch (error) {{
      this.sendError(res, `Error in {controller_name}: ${{error}}`)
    }}
  }}
}}
"""


class BaseControllerTemplate(CodeTemplate):
    """Template for base controller class."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        return """import { Request, Response } from 'express'

export abstract class BaseController {
  // TODO: Implement base controller methods
  
  protected sendResponse(res: Response, data: any, statusCode: number = 200) {
    res.status(statusCode).json(data)
  }
  
  protected sendError(res: Response, message: string, statusCode: number = 500) {
    res.status(statusCode).json({ error: message })
  }
  
  protected validateRequired(data: any, fields: string[]): boolean {
    for (const field of fields) {
      if (!data[field]) {
        return false
      }
    }
    return true
  }
  
  protected sanitizeInput(data: any): any {
    // TODO: Implement input sanitization
    return data
  }
}
"""


class BackendServiceTemplate(CodeTemplate):
    """Template for backend service classes."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        service_name = self.get_class_name_from_filename(file_path.stem)
        
        return f"""import {{ BaseService }} from './base/BaseService'

export class {service_name} extends BaseService {{
  // TODO: Implement {service_name} methods
  
  async process(data: any): Promise<any> {{
    try {{
      if (!this.validateInput(data)) {{
        throw new Error('Invalid input data')
      }}
      
      // TODO: Implement service logic
      return {{ success: true, data }}
    }} catch (error) {{
      this.handleError(error)
    }}
  }}
  
  async findById(id: string): Promise<any> {{
    try {{
      // TODO: Implement find by ID logic
      return {{ id, found: true }}
    }} catch (error) {{
      this.handleError(error)
    }}
  }}
  
  async create(data: any): Promise<any> {{
    try {{
      if (!this.validateInput(data)) {{
        throw new Error('Invalid input data')
      }}
      
      // TODO: Implement create logic
      return {{ created: true, data }}
    }} catch (error) {{
      this.handleError(error)
    }}
  }}
  
  async update(id: string, data: any): Promise<any> {{
    try {{
      if (!this.validateInput(data)) {{
        throw new Error('Invalid input data')
      }}
      
      // TODO: Implement update logic
      return {{ updated: true, id, data }}
    }} catch (error) {{
      this.handleError(error)
    }}
  }}
  
  async delete(id: string): Promise<any> {{
    try {{
      // TODO: Implement delete logic
      return {{ deleted: true, id }}
    }} catch (error) {{
      this.handleError(error)
    }}
  }}
}}

export default new {service_name}()
"""


class BackendBaseServiceTemplate(CodeTemplate):
    """Template for backend base service class."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        return """export abstract class BaseService {
  // TODO: Implement base service methods
  
  protected validateInput(input: any): boolean {
    return input !== null && input !== undefined
  }
  
  protected handleError(error: any): never {
    console.error('Service error:', error)
    throw new Error(`Service error: ${error}`)
  }
  
  protected async executeWithTransaction<T>(operation: () => Promise<T>): Promise<T> {
    // TODO: Implement database transaction wrapper
    try {
      return await operation()
    } catch (error) {
      this.handleError(error)
    }
  }
  
  protected sanitizeData(data: any): any {
    // TODO: Implement data sanitization
    return data
  }
  
  protected validateSchema(data: any, schema: any): boolean {
    // TODO: Implement schema validation
    return true
  }
}
"""


class ModelTemplate(CodeTemplate):
    """Template for data models."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        model_name = self.get_class_name_from_filename(file_path.stem)
        
        return f"""import {{ BaseModel }} from './BaseModel'

export interface I{model_name} {{
  id?: string
  createdAt?: Date
  updatedAt?: Date
  // TODO: Add {model_name} properties
}}

export class {model_name} extends BaseModel implements I{model_name} {{
  public id?: string
  public createdAt?: Date
  public updatedAt?: Date
  
  // TODO: Add {model_name} properties
  
  constructor(data?: Partial<I{model_name}>) {{
    super()
    if (data) {{
      Object.assign(this, data)
    }}
  }}
  
  // TODO: Add {model_name} methods
  
  validate(): boolean {{
    // TODO: Implement validation logic
    return true
  }}
  
  toJSON(): I{model_name} {{
    return {{
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      // TODO: Add other properties
    }}
  }}
}}
"""


class RepositoryTemplate(CodeTemplate):
    """Template for data repositories."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        repo_name = self.get_class_name_from_filename(file_path.stem)
        model_name = repo_name.replace('Repository', '')
        
        return f"""import {{ BaseRepository }} from './base/BaseRepository'
import {{ {model_name}, I{model_name} }} from '../models/{model_name}'

export class {repo_name} extends BaseRepository<{model_name}> {{
  
  async findById(id: string): Promise<{model_name} | null> {{
    try {{
      // TODO: Implement database query
      const data = await this.executeQuery('SELECT * FROM {model_name.lower()}s WHERE id = ?', [id])
      return data ? new {model_name}(data) : null
    }} catch (error) {{
      this.handleError(error)
    }}
  }}
  
  async findAll(): Promise<{model_name}[]> {{
    try {{
      // TODO: Implement database query
      const results = await this.executeQuery('SELECT * FROM {model_name.lower()}s')
      return results.map((data: any) => new {model_name}(data))
    }} catch (error) {{
      this.handleError(error)
    }}
  }}
  
  async create(data: I{model_name}): Promise<{model_name}> {{
    try {{
      // TODO: Implement database insert
      const result = await this.executeQuery(
        'INSERT INTO {model_name.lower()}s (...) VALUES (...)',
        Object.values(data)
      )
      return new {model_name}({{ ...data, id: result.insertId }})
    }} catch (error) {{
      this.handleError(error)
    }}
  }}
  
  async update(id: string, data: Partial<I{model_name}>): Promise<{model_name} | null> {{
    try {{
      // TODO: Implement database update
      await this.executeQuery(
        'UPDATE {model_name.lower()}s SET ... WHERE id = ?',
        [...Object.values(data), id]
      )
      return this.findById(id)
    }} catch (error) {{
      this.handleError(error)
    }}
  }}
  
  async delete(id: string): Promise<boolean> {{
    try {{
      // TODO: Implement database delete
      const result = await this.executeQuery('DELETE FROM {model_name.lower()}s WHERE id = ?', [id])
      return result.affectedRows > 0
    }} catch (error) {{
      this.handleError(error)
    }}
  }}
}}

export default new {repo_name}()
"""