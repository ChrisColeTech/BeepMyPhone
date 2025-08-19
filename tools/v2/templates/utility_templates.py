#!/usr/bin/env python3
"""
Utility and misc file templates.
"""

from pathlib import Path
from typing import Dict, Any
from templates.base_templates import CodeTemplate


class UtilityTemplate(CodeTemplate):
    """Template for utility functions."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        util_name = file_path.stem
        class_name = self.get_class_name_from_filename(util_name)
        
        return f"""/**
 * {class_name} utility functions
 * TODO: Add description of what this utility does
 */

// TODO: Add utility functions for {util_name}

export const {util_name} = {{
  // TODO: Implement utility methods
  
  /**
   * Example utility function
   * @param input - Input parameter
   * @returns Processed result
   */
  process(input: any): any {{
    // TODO: Implement processing logic
    return input
  }},
  
  /**
   * Validation utility
   * @param data - Data to validate
   * @returns True if valid
   */
  validate(data: any): boolean {{
    // TODO: Implement validation logic
    return data !== null && data !== undefined
  }},
  
  /**
   * Formatting utility
   * @param value - Value to format
   * @returns Formatted string
   */
  format(value: any): string {{
    // TODO: Implement formatting logic
    return String(value)
  }}
}}

// Individual utility functions can also be exported
export function {util_name}Helper(data: any): any {{
  // TODO: Implement helper function
  return data
}}

export default {util_name}
"""


class TypeDefinitionTemplate(CodeTemplate):
    """Template for TypeScript type definitions."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        type_name = file_path.stem
        base_type = self.get_class_name_from_filename(type_name)
        
        return f"""/**
 * Type definitions for {base_type}
 * TODO: Add description of these types
 */

// Base interface
export interface I{base_type} {{
  id: string
  createdAt: Date
  updatedAt: Date
  // TODO: Add specific properties
}}

// Create/Update types
export interface Create{base_type}Request {{
  // TODO: Add required fields for creation
}}

export interface Update{base_type}Request {{
  // TODO: Add fields that can be updated
}}

// Response types
export interface {base_type}Response {{
  success: boolean
  data?: I{base_type}
  error?: string
}}

export interface {base_type}ListResponse {{
  success: boolean
  data?: I{base_type}[]
  total?: number
  page?: number
  limit?: number
  error?: string
}}

// Filter and query types
export interface {base_type}Filter {{
  // TODO: Add filter criteria
  search?: string
  status?: string
  createdAfter?: Date
  createdBefore?: Date
}}

export interface {base_type}Sort {{
  field: keyof I{base_type}
  direction: 'asc' | 'desc'
}}

export interface {base_type}Query {{
  filter?: {base_type}Filter
  sort?: {base_type}Sort
  page?: number
  limit?: number
}}

// Event types
export interface {base_type}Event {{
  type: '{base_type.lower()}_created' | '{base_type.lower()}_updated' | '{base_type.lower()}_deleted'
  data: I{base_type}
  timestamp: Date
  userId?: string
}}

// TODO: Add more specific types as needed
export type {base_type}Status = 'active' | 'inactive' | 'pending' | 'archived'

export type {base_type}Permission = 'read' | 'write' | 'delete' | 'admin'
"""


class ConstantsTemplate(CodeTemplate):
    """Template for constants files."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        return """/**
 * Application constants
 * TODO: Add project-specific constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
} as const

// WebSocket Configuration
export const WEBSOCKET_CONFIG = {
  URL: process.env.REACT_APP_WS_URL || 'ws://localhost:3001',
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 2000,
  HEARTBEAT_INTERVAL: 30000
} as const

// Application Routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  DEVICES: '/devices',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  LOGIN: '/login',
  REGISTER: '/register'
} as const

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  DEVICE_CONFIG: 'device_config',
  NOTIFICATION_SETTINGS: 'notification_settings'
} as const

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
} as const

// Device Status
export const DEVICE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  CONNECTING: 'connecting',
  ERROR: 'error'
} as const

// Notification Priorities
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
} as const

// File Size Limits
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain']
} as const

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  EMAIL_REGEX: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,
  PHONE_REGEX: /^\\+?[1-9]\\d{1,14}$/
} as const

// UI Configuration
export const UI_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 5000
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.'
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: 'Changes saved successfully.',
  DELETE_SUCCESS: 'Item deleted successfully.',
  UPDATE_SUCCESS: 'Item updated successfully.',
  CREATE_SUCCESS: 'Item created successfully.',
  LOGIN_SUCCESS: 'Login successful.',
  LOGOUT_SUCCESS: 'Logout successful.'
} as const

// TODO: Add more constants as needed
"""


class IndexTemplate(CodeTemplate):
    """Template for index files that export other modules."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        # Get the parent directory name for context
        parent_dir = file_path.parent.name
        
        return f"""/**
 * {parent_dir.capitalize()} module exports
 * This file exports all public APIs from the {parent_dir} module
 */

// TODO: Add exports for {parent_dir} module

// Example exports:
// export {{ SomeClass }} from './SomeClass'
// export {{ SomeFunction }} from './utils'
// export type {{ SomeType }} from './types'

// Export everything from submodules
// export * from './submodule'

// Default export (if applicable)
// export {{ default as {parent_dir.capitalize()} }} from './main'

// TODO: Replace with actual exports for {parent_dir}
export {{}}
"""


class MiddlewareTemplate(CodeTemplate):
    """Template for Express middleware."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        middleware_name = file_path.stem
        class_name = self.get_class_name_from_filename(middleware_name)
        
        return f"""import {{ Request, Response, NextFunction }} from 'express'

/**
 * {class_name} middleware
 * TODO: Add description of what this middleware does
 */

export interface {class_name}Options {{
  // TODO: Add configuration options
  enabled?: boolean
}}

export function {middleware_name}(options: {class_name}Options = {{}}) {{
  return (req: Request, res: Response, next: NextFunction) => {{
    try {{
      // TODO: Implement middleware logic
      
      // Example: Add custom properties to request
      // (req as any).{middleware_name} = {{ /* custom data */ }}
      
      // Example: Validate request
      // if (!isValidRequest(req)) {{
      //   return res.status(400).json({{ error: 'Invalid request' }})
      // }}
      
      // Example: Log request
      // console.log(`{class_name}: ${{req.method}} ${{req.path}}`)
      
      // Continue to next middleware
      next()
    }} catch (error) {{
      console.error(`{class_name} error:`, error)
      res.status(500).json({{ error: 'Internal server error' }})
    }}
  }}
}}

// Alternative function-based middleware
export const {middleware_name}Sync = (req: Request, res: Response, next: NextFunction) => {{
  try {{
    // TODO: Implement synchronous middleware logic
    next()
  }} catch (error) {{
    console.error(`{class_name} error:`, error)
    res.status(500).json({{ error: 'Internal server error' }})
  }}
}}

// Async middleware wrapper
export const asyncMiddleware = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {{
  return (req: Request, res: Response, next: NextFunction) => {{
    Promise.resolve(fn(req, res, next)).catch(next)
  }}
}}

export default {middleware_name}
"""


class RouteTemplate(CodeTemplate):
    """Template for Express routes."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        route_name = file_path.stem
        controller_name = self.get_class_name_from_filename(route_name)
        
        return f"""import {{ Router }} from 'express'
import {{ {controller_name}Controller }} from '../controllers/{controller_name}Controller'
// TODO: Import middleware as needed
// import {{ authMiddleware }} from '../middleware/auth'
// import {{ validateMiddleware }} from '../middleware/validation'

const router = Router()
const controller = new {controller_name}Controller()

/**
 * {controller_name} routes
 * TODO: Add description of these routes
 */

// GET /{route_name.lower()}
router.get('/', 
  // TODO: Add middleware if needed
  // authMiddleware,
  controller.index.bind(controller)
)

// GET /{route_name.lower()}/:id
router.get('/:id',
  // TODO: Add middleware if needed
  // authMiddleware,
  controller.show.bind(controller)
)

// POST /{route_name.lower()}
router.post('/',
  // TODO: Add middleware if needed
  // authMiddleware,
  // validateMiddleware(createSchema),
  controller.create.bind(controller)
)

// PUT /{route_name.lower()}/:id
router.put('/:id',
  // TODO: Add middleware if needed
  // authMiddleware,
  // validateMiddleware(updateSchema),
  controller.update.bind(controller)
)

// DELETE /{route_name.lower()}/:id
router.delete('/:id',
  // TODO: Add middleware if needed
  // authMiddleware,
  controller.delete.bind(controller)
)

// TODO: Add custom routes specific to {route_name}
// router.post('/:id/custom-action', controller.customAction.bind(controller))

export default router
"""