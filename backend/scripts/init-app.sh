#!/bin/bash

# BeepMyPhone Backend Application Scaffolding Script
# This script creates comprehensive TypeScript stub files according to PROJECT_STRUCTURE.md
# following SOLID principles and clean architecture standards

set -euo pipefail

# Script metadata
SCRIPT_NAME="BeepMyPhone Backend Init Script"
SCRIPT_VERSION="2.0.0"
SCRIPT_DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Project structure configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="${PROJECT_ROOT}/app"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $*"
}

log_substep() {
    echo -e "${CYAN}  └─${NC} $*"
}

# Progress tracking
TOTAL_STEPS=12
CURRENT_STEP=0

show_progress() {
    local step_name="$1"
    CURRENT_STEP=$((CURRENT_STEP + 1))
    echo
    echo -e "${BOLD}=== STEP ${CURRENT_STEP}/${TOTAL_STEPS}: ${step_name} ===${NC}"
}

# Header
print_header() {
    echo
    echo -e "${BOLD}${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${GREEN}║                 ${SCRIPT_NAME}                ║${NC}"
    echo -e "${BOLD}${GREEN}║                    Version ${SCRIPT_VERSION}                     ║${NC}"
    echo -e "${BOLD}${GREEN}║                                                            ║${NC}"
    echo -e "${BOLD}${GREEN}║   Creating comprehensive TypeScript stub files            ║${NC}"
    echo -e "${BOLD}${GREEN}║   following SOLID principles and clean architecture       ║${NC}"
    echo -e "${BOLD}${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo
    log_info "Starting comprehensive file creation at: ${SCRIPT_DATE}"
    log_info "Project root: ${PROJECT_ROOT}"
    log_info "App directory: ${APP_DIR}"
    echo
}

# Step 1: Validate environment
validate_environment() {
    show_progress "Environment Validation"
    
    log_substep "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18+ before running this script."
        exit 1
    fi
    
    local node_version
    node_version=$(node --version | sed 's/v//')
    log_success "Node.js ${node_version} detected"
    
    log_substep "Validating documentation files..."
    if [[ ! -f "${PROJECT_ROOT}/docs/ARCHITECTURE.md" ]]; then
        log_error "ARCHITECTURE.md not found. This script requires the architecture documentation."
        exit 1
    fi
    
    if [[ ! -f "${PROJECT_ROOT}/docs/PROJECT_STRUCTURE.md" ]]; then
        log_error "PROJECT_STRUCTURE.md not found. This script requires the project structure documentation."
        exit 1
    fi
    
    log_success "Environment validation completed successfully"
}

# Step 2: Create main application files
create_main_files() {
    show_progress "Main Application Files"
    
    cd "${APP_DIR}"
    
    log_substep "Creating main entry points..."
    
    cat > src/index.ts << 'EOF'
import { createServer } from './server'
import { logger } from './utils/logger'

async function bootstrap(): Promise<void> {
  try {
    const server = await createServer()
    const port = process.env.PORT || 3000
    
    server.listen(port, () => {
      logger.info(`BeepMyPhone backend server started on port ${port}`)
    })
    
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully...')
      process.exit(0)
    })
    
    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully...')
      process.exit(0)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

bootstrap().catch(error => {
  console.error('Bootstrap failed:', error)
  process.exit(1)
})
EOF

    cat > src/app.ts << 'EOF'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { json, urlencoded } from 'express'
import { ConfigService } from './config'
import { logger } from './utils/logger'
import { errorHandler } from './api/middleware/errorHandler'
import { apiRoutes } from './api/routes'

export function createApp(): express.Application {
  const app = express()
  const config = ConfigService.getInstance()
  
  // Security middleware
  app.use(helmet())
  app.use(cors(config.getCorsOptions()))
  
  // Body parsing middleware
  app.use(json({ limit: '10mb' }))
  app.use(urlencoded({ extended: true, limit: '10mb' }))
  
  // Request logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`)
    next()
  })
  
  // API routes
  app.use('/api', apiRoutes)
  
  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() })
  })
  
  // Error handling
  app.use(errorHandler)
  
  return app
}
EOF

    cat > src/server.ts << 'EOF'
import { createServer as createHttpServer, Server } from 'http'
import { createApp } from './app'
import { SocketServer } from './websocket/SocketServer'
import { ConfigService } from './config'
import { logger } from './utils/logger'

export async function createServer(): Promise<Server> {
  const app = createApp()
  const httpServer = createHttpServer(app)
  const config = ConfigService.getInstance()
  
  // Initialize WebSocket server
  const socketServer = new SocketServer(httpServer)
  await socketServer.initialize()
  
  logger.info('HTTP and WebSocket servers created successfully')
  
  return httpServer
}
EOF

    log_success "Main application files created"
}

# Step 3: Create configuration layer
create_config_layer() {
    show_progress "Configuration Layer"
    
    cd "${APP_DIR}"
    
    log_substep "Creating configuration files..."
    
    cat > src/config/index.ts << 'EOF'
import { DatabaseConfig } from './database'
import { ServerConfig } from './server'
import { SecurityConfig } from './security'
import { ValidationConfig } from './validation'

export class ConfigService {
  private static instance: ConfigService
  private databaseConfig: DatabaseConfig
  private serverConfig: ServerConfig
  private securityConfig: SecurityConfig
  private validationConfig: ValidationConfig

  private constructor() {
    this.databaseConfig = new DatabaseConfig()
    this.serverConfig = new ServerConfig()
    this.securityConfig = new SecurityConfig()
    this.validationConfig = new ValidationConfig()
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService()
    }
    return ConfigService.instance
  }

  public getDatabaseConfig() {
    return this.databaseConfig
  }

  public getServerConfig() {
    return this.serverConfig
  }

  public getSecurityConfig() {
    return this.securityConfig
  }

  public getValidationConfig() {
    return this.validationConfig
  }

  public getCorsOptions() {
    return this.securityConfig.getCorsOptions()
  }

  public getJwtSecret() {
    return this.securityConfig.getJwtSecret()
  }
}

export * from './database'
export * from './server'
export * from './security'
export * from './validation'
EOF

    cat > src/config/database.ts << 'EOF'
export class DatabaseConfig {
  private readonly connectionString: string
  private readonly maxConnections: number
  private readonly connectionTimeout: number

  constructor() {
    this.connectionString = process.env.DATABASE_URL || 'sqlite:./data/beepmyphone.db'
    this.maxConnections = parseInt(process.env.DB_MAX_CONNECTIONS || '10')
    this.connectionTimeout = parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000')
  }

  public getConnectionString(): string {
    return this.connectionString
  }

  public getMaxConnections(): number {
    return this.maxConnections
  }

  public getConnectionTimeout(): number {
    return this.connectionTimeout
  }

  public getConnectionOptions() {
    return {
      connectionString: this.connectionString,
      maxConnections: this.maxConnections,
      connectionTimeout: this.connectionTimeout
    }
  }
}
EOF

    cat > src/config/server.ts << 'EOF'
export class ServerConfig {
  private readonly port: number
  private readonly host: string
  private readonly environment: string
  private readonly logLevel: string

  constructor() {
    this.port = parseInt(process.env.PORT || '3000')
    this.host = process.env.HOST || '0.0.0.0'
    this.environment = process.env.NODE_ENV || 'development'
    this.logLevel = process.env.LOG_LEVEL || 'info'
  }

  public getPort(): number {
    return this.port
  }

  public getHost(): string {
    return this.host
  }

  public getEnvironment(): string {
    return this.environment
  }

  public getLogLevel(): string {
    return this.logLevel
  }

  public isDevelopment(): boolean {
    return this.environment === 'development'
  }

  public isProduction(): boolean {
    return this.environment === 'production'
  }
}
EOF

    cat > src/config/security.ts << 'EOF'
export class SecurityConfig {
  private readonly jwtSecret: string
  private readonly jwtExpiresIn: string
  private readonly allowedOrigins: string[]
  private readonly rateLimitWindowMs: number
  private readonly rateLimitMaxRequests: number

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production'
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h'
    this.allowedOrigins = (process.env.ALLOWED_ORIGINS || '*').split(',')
    this.rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') // 15 minutes
    this.rateLimitMaxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
  }

  public getJwtSecret(): string {
    return this.jwtSecret
  }

  public getJwtExpiresIn(): string {
    return this.jwtExpiresIn
  }

  public getAllowedOrigins(): string[] {
    return this.allowedOrigins
  }

  public getCorsOptions() {
    return {
      origin: this.allowedOrigins.includes('*') ? true : this.allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  }

  public getRateLimitOptions() {
    return {
      windowMs: this.rateLimitWindowMs,
      max: this.rateLimitMaxRequests,
      message: 'Too many requests from this IP, please try again later.'
    }
  }
}
EOF

    cat > src/config/validation.ts << 'EOF'
export class ValidationConfig {
  private readonly maxFileSize: number
  private readonly allowedFileTypes: string[]
  private readonly maxStringLength: number
  private readonly maxArrayLength: number

  constructor() {
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB
    this.allowedFileTypes = (process.env.ALLOWED_FILE_TYPES || 'json,txt,log').split(',')
    this.maxStringLength = parseInt(process.env.MAX_STRING_LENGTH || '1000')
    this.maxArrayLength = parseInt(process.env.MAX_ARRAY_LENGTH || '100')
  }

  public getMaxFileSize(): number {
    return this.maxFileSize
  }

  public getAllowedFileTypes(): string[] {
    return this.allowedFileTypes
  }

  public getMaxStringLength(): number {
    return this.maxStringLength
  }

  public getMaxArrayLength(): number {
    return this.maxArrayLength
  }

  public isValidFileType(fileType: string): boolean {
    return this.allowedFileTypes.includes(fileType.toLowerCase())
  }
}
EOF

    log_success "Configuration layer created"
}

# Step 4: Create controller layer
create_controller_layer() {
    show_progress "Controller Layer"
    
    cd "${APP_DIR}"
    
    log_substep "Creating base controllers..."
    
    cat > src/controllers/base/BaseController.ts << 'EOF'
import { Request, Response, NextFunction } from 'express'
import { logger } from '../../utils/logger'

export abstract class BaseController {
  protected logger = logger

  protected handleSuccess(res: Response, data: any, message?: string): void {
    res.json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    })
  }

  protected handleError(res: Response, error: Error, statusCode = 500): void {
    this.logger.error('Controller error:', error)
    res.status(statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: statusCode
      },
      timestamp: new Date().toISOString()
    })
  }

  protected handleValidationError(res: Response, errors: any[]): void {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errors
      },
      timestamp: new Date().toISOString()
    })
  }

  protected handleNotFound(res: Response, resource = 'Resource'): void {
    res.status(404).json({
      success: false,
      error: {
        message: `${resource} not found`,
        code: 404
      },
      timestamp: new Date().toISOString()
    })
  }

  protected asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next)
    }
  }
}
EOF

    cat > src/controllers/base/ApiController.ts << 'EOF'
import { BaseController } from './BaseController'
import { Request, Response } from 'express'

export abstract class ApiController extends BaseController {
  protected getPagination(req: Request) {
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
    const offset = (page - 1) * limit

    return { page, limit, offset }
  }

  protected getFilters(req: Request) {
    const { search, status, type, ...filters } = req.query
    return { search, status, type, filters }
  }

  protected handlePaginatedResponse(res: Response, items: any[], totalItems: number, page: number, limit: number): void {
    const totalPages = Math.ceil(totalItems / limit)
    const hasNext = page < totalPages
    const hasPrevious = page > 1

    this.handleSuccess(res, {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNext,
        hasPrevious
      }
    })
  }
}
EOF

    log_substep "Creating device controllers..."
    
    cat > src/controllers/devices/DeviceController.ts << 'EOF'
import { Request, Response } from 'express'
import { ApiController } from '../base/ApiController'
import { DeviceService } from '../../services/devices/DeviceService'

export class DeviceController extends ApiController {
  private deviceService: DeviceService

  constructor() {
    super()
    this.deviceService = new DeviceService()
  }

  public getDevices = this.asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, offset } = this.getPagination(req)
    const filters = this.getFilters(req)
    
    const { devices, totalCount } = await this.deviceService.getDevices({
      ...filters,
      limit,
      offset
    })
    
    this.handlePaginatedResponse(res, devices, totalCount, page, limit)
  })

  public getDevice = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const device = await this.deviceService.getDeviceById(id)
    
    if (!device) {
      return this.handleNotFound(res, 'Device')
    }
    
    this.handleSuccess(res, device)
  })

  public createDevice = this.asyncHandler(async (req: Request, res: Response) => {
    const deviceData = req.body
    const device = await this.deviceService.createDevice(deviceData)
    this.handleSuccess(res, device, 'Device created successfully')
  })

  public updateDevice = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const updates = req.body
    
    const device = await this.deviceService.updateDevice(id, updates)
    
    if (!device) {
      return this.handleNotFound(res, 'Device')
    }
    
    this.handleSuccess(res, device, 'Device updated successfully')
  })

  public deleteDevice = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const deleted = await this.deviceService.deleteDevice(id)
    
    if (!deleted) {
      return this.handleNotFound(res, 'Device')
    }
    
    this.handleSuccess(res, null, 'Device deleted successfully')
  })
}
EOF

    cat > src/controllers/devices/RegistrationController.ts << 'EOF'
import { Request, Response } from 'express'
import { ApiController } from '../base/ApiController'
import { RegistrationService } from '../../services/devices/RegistrationService'

export class RegistrationController extends ApiController {
  private registrationService: RegistrationService

  constructor() {
    super()
    this.registrationService = new RegistrationService()
  }

  public registerDevice = this.asyncHandler(async (req: Request, res: Response) => {
    const registrationData = req.body
    const device = await this.registrationService.registerDevice(registrationData)
    this.handleSuccess(res, device, 'Device registered successfully')
  })

  public getRegistrationQR = this.asyncHandler(async (req: Request, res: Response) => {
    const qrCode = await this.registrationService.generateRegistrationQR()
    this.handleSuccess(res, { qrCode })
  })

  public verifyRegistration = this.asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body
    const result = await this.registrationService.verifyRegistration(token)
    this.handleSuccess(res, result)
  })
}
EOF

    cat > src/controllers/devices/DiscoveryController.ts << 'EOF'
import { Request, Response } from 'express'
import { ApiController } from '../base/ApiController'
import { DiscoveryService } from '../../services/discovery/DiscoveryService'

export class DiscoveryController extends ApiController {
  private discoveryService: DiscoveryService

  constructor() {
    super()
    this.discoveryService = new DiscoveryService()
  }

  public startDiscovery = this.asyncHandler(async (req: Request, res: Response) => {
    await this.discoveryService.startDiscovery()
    this.handleSuccess(res, null, 'Discovery started')
  })

  public stopDiscovery = this.asyncHandler(async (req: Request, res: Response) => {
    await this.discoveryService.stopDiscovery()
    this.handleSuccess(res, null, 'Discovery stopped')
  })

  public getDiscoveredDevices = this.asyncHandler(async (req: Request, res: Response) => {
    const devices = await this.discoveryService.getDiscoveredDevices()
    this.handleSuccess(res, devices)
  })
}
EOF

    log_substep "Creating notification controllers..."
    
    cat > src/controllers/notifications/NotificationController.ts << 'EOF'
import { Request, Response } from 'express'
import { ApiController } from '../base/ApiController'
import { NotificationService } from '../../services/notifications/NotificationService'

export class NotificationController extends ApiController {
  private notificationService: NotificationService

  constructor() {
    super()
    this.notificationService = new NotificationService()
  }

  public getNotifications = this.asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, offset } = this.getPagination(req)
    const filters = this.getFilters(req)
    
    const { notifications, totalCount } = await this.notificationService.getNotifications({
      ...filters,
      limit,
      offset
    })
    
    this.handlePaginatedResponse(res, notifications, totalCount, page, limit)
  })

  public sendNotification = this.asyncHandler(async (req: Request, res: Response) => {
    const notificationData = req.body
    const notification = await this.notificationService.sendNotification(notificationData)
    this.handleSuccess(res, notification, 'Notification sent successfully')
  })

  public getNotificationHistory = this.asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, offset } = this.getPagination(req)
    const { deviceId } = req.params
    
    const { notifications, totalCount } = await this.notificationService.getNotificationHistory(deviceId, {
      limit,
      offset
    })
    
    this.handlePaginatedResponse(res, notifications, totalCount, page, limit)
  })
}
EOF

    cat > src/controllers/notifications/FilterController.ts << 'EOF'
import { Request, Response } from 'express'
import { ApiController } from '../base/ApiController'
import { FilteringService } from '../../services/filtering/FilteringService'

export class FilterController extends ApiController {
  private filteringService: FilteringService

  constructor() {
    super()
    this.filteringService = new FilteringService()
  }

  public getFilters = this.asyncHandler(async (req: Request, res: Response) => {
    const filters = await this.filteringService.getFilters()
    this.handleSuccess(res, filters)
  })

  public createFilter = this.asyncHandler(async (req: Request, res: Response) => {
    const filterData = req.body
    const filter = await this.filteringService.createFilter(filterData)
    this.handleSuccess(res, filter, 'Filter created successfully')
  })

  public updateFilter = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const updates = req.body
    
    const filter = await this.filteringService.updateFilter(id, updates)
    
    if (!filter) {
      return this.handleNotFound(res, 'Filter')
    }
    
    this.handleSuccess(res, filter, 'Filter updated successfully')
  })

  public deleteFilter = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const deleted = await this.filteringService.deleteFilter(id)
    
    if (!deleted) {
      return this.handleNotFound(res, 'Filter')
    }
    
    this.handleSuccess(res, null, 'Filter deleted successfully')
  })
}
EOF

    cat > src/controllers/notifications/HistoryController.ts << 'EOF'
import { Request, Response } from 'express'
import { ApiController } from '../base/ApiController'
import { NotificationService } from '../../services/notifications/NotificationService'

export class HistoryController extends ApiController {
  private notificationService: NotificationService

  constructor() {
    super()
    this.notificationService = new NotificationService()
  }

  public getHistory = this.asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, offset } = this.getPagination(req)
    const filters = this.getFilters(req)
    
    const { notifications, totalCount } = await this.notificationService.getNotificationHistory(undefined, {
      ...filters,
      limit,
      offset
    })
    
    this.handlePaginatedResponse(res, notifications, totalCount, page, limit)
  })

  public exportHistory = this.asyncHandler(async (req: Request, res: Response) => {
    const { format = 'json' } = req.query
    const filters = this.getFilters(req)
    
    const exportData = await this.notificationService.exportNotificationHistory(filters, format as string)
    
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename=notifications.${format}`)
    res.send(exportData)
  })

  public clearHistory = this.asyncHandler(async (req: Request, res: Response) => {
    const { olderThan } = req.body
    const cleared = await this.notificationService.clearNotificationHistory(olderThan)
    this.handleSuccess(res, { cleared }, 'History cleared successfully')
  })
}
EOF

    log_substep "Creating auth controllers..."
    
    cat > src/controllers/auth/AuthController.ts << 'EOF'
import { Request, Response } from 'express'
import { ApiController } from '../base/ApiController'
import { AuthService } from '../../services/auth/AuthService'

export class AuthController extends ApiController {
  private authService: AuthService

  constructor() {
    super()
    this.authService = new AuthService()
  }

  public login = this.asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body
    const result = await this.authService.login(username, password)
    this.handleSuccess(res, result, 'Login successful')
  })

  public logout = this.asyncHandler(async (req: Request, res: Response) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (token) {
      await this.authService.logout(token)
    }
    this.handleSuccess(res, null, 'Logout successful')
  })

  public refreshToken = this.asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body
    const result = await this.authService.refreshToken(refreshToken)
    this.handleSuccess(res, result, 'Token refreshed')
  })

  public verifyToken = this.asyncHandler(async (req: Request, res: Response) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return this.handleError(res, new Error('No token provided'), 401)
    }
    
    const user = await this.authService.verifyToken(token)
    this.handleSuccess(res, user)
  })
}
EOF

    cat > src/controllers/auth/TokenController.ts << 'EOF'
import { Request, Response } from 'express'
import { ApiController } from '../base/ApiController'
import { TokenService } from '../../services/auth/TokenService'

export class TokenController extends ApiController {
  private tokenService: TokenService

  constructor() {
    super()
    this.tokenService = new TokenService()
  }

  public generateApiToken = this.asyncHandler(async (req: Request, res: Response) => {
    const { name, permissions } = req.body
    const token = await this.tokenService.generateApiToken(name, permissions)
    this.handleSuccess(res, token, 'API token generated')
  })

  public revokeToken = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    await this.tokenService.revokeToken(id)
    this.handleSuccess(res, null, 'Token revoked')
  })

  public listTokens = this.asyncHandler(async (req: Request, res: Response) => {
    const tokens = await this.tokenService.listTokens()
    this.handleSuccess(res, tokens)
  })
}
EOF

    log_substep "Creating system controllers..."
    
    cat > src/controllers/system/HealthController.ts << 'EOF'
import { Request, Response } from 'express'
import { ApiController } from '../base/ApiController'
import { HealthService } from '../../services/system/HealthService'

export class HealthController extends ApiController {
  private healthService: HealthService

  constructor() {
    super()
    this.healthService = new HealthService()
  }

  public getHealth = this.asyncHandler(async (req: Request, res: Response) => {
    const health = await this.healthService.getSystemHealth()
    this.handleSuccess(res, health)
  })

  public getReadiness = this.asyncHandler(async (req: Request, res: Response) => {
    const readiness = await this.healthService.getReadiness()
    this.handleSuccess(res, readiness)
  })

  public getLiveness = this.asyncHandler(async (req: Request, res: Response) => {
    const liveness = await this.healthService.getLiveness()
    this.handleSuccess(res, liveness)
  })
}
EOF

    cat > src/controllers/system/ConfigController.ts << 'EOF'
import { Request, Response } from 'express'
import { ApiController } from '../base/ApiController'
import { ConfigService as SystemConfigService } from '../../services/config/ConfigService'

export class ConfigController extends ApiController {
  private configService: SystemConfigService

  constructor() {
    super()
    this.configService = new SystemConfigService()
  }

  public getConfig = this.asyncHandler(async (req: Request, res: Response) => {
    const config = await this.configService.getConfiguration()
    this.handleSuccess(res, config)
  })

  public updateConfig = this.asyncHandler(async (req: Request, res: Response) => {
    const updates = req.body
    const config = await this.configService.updateConfiguration(updates)
    this.handleSuccess(res, config, 'Configuration updated')
  })

  public resetConfig = this.asyncHandler(async (req: Request, res: Response) => {
    await this.configService.resetToDefaults()
    this.handleSuccess(res, null, 'Configuration reset to defaults')
  })
}
EOF

    cat > src/controllers/system/MetricsController.ts << 'EOF'
import { Request, Response } from 'express'
import { ApiController } from '../base/ApiController'
import { MetricsService } from '../../services/monitoring/MetricsService'

export class MetricsController extends ApiController {
  private metricsService: MetricsService

  constructor() {
    super()
    this.metricsService = new MetricsService()
  }

  public getMetrics = this.asyncHandler(async (req: Request, res: Response) => {
    const metrics = await this.metricsService.getSystemMetrics()
    this.handleSuccess(res, metrics)
  })

  public getPerformanceMetrics = this.asyncHandler(async (req: Request, res: Response) => {
    const { timeRange = '1h' } = req.query
    const metrics = await this.metricsService.getPerformanceMetrics(timeRange as string)
    this.handleSuccess(res, metrics)
  })

  public getUsageStats = this.asyncHandler(async (req: Request, res: Response) => {
    const stats = await this.metricsService.getUsageStatistics()
    this.handleSuccess(res, stats)
  })
}
EOF

    cat > src/controllers/index.ts << 'EOF'
export * from './base/BaseController'
export * from './base/ApiController'
export * from './devices/DeviceController'
export * from './devices/RegistrationController'
export * from './devices/DiscoveryController'
export * from './notifications/NotificationController'
export * from './notifications/FilterController'
export * from './notifications/HistoryController'
export * from './auth/AuthController'
export * from './auth/TokenController'
export * from './system/HealthController'
export * from './system/ConfigController'
export * from './system/MetricsController'
EOF

    log_success "Controller layer created"
}

# Step 5: Create service layer
create_service_layer() {
    show_progress "Service Layer"
    
    cd "${APP_DIR}"
    
    log_substep "Creating base services..."
    
    cat > src/services/base/BaseService.ts << 'EOF'
import { logger } from '../../utils/logger'

export abstract class BaseService {
  protected logger = logger

  protected validateInput(input: any, rules: any): void {
    if (!input) {
      throw new Error('Input is required')
    }
    // Basic validation logic here
  }

  protected handleError(error: Error, context?: string): never {
    this.logger.error(`Service error ${context ? `in ${context}` : ''}:`, error)
    throw error
  }

  protected logOperation(operation: string, details?: any): void {
    this.logger.info(`Service operation: ${operation}`, details)
  }
}
EOF

    log_substep "Creating notification services..."
    
    cat > src/services/notifications/NotificationService.ts << 'EOF'
import { BaseService } from '../base/BaseService'

export class NotificationService extends BaseService {
  async getNotifications(options: any) {
    this.logOperation('getNotifications', options)
    // Implementation will be added
    return { notifications: [], totalCount: 0 }
  }

  async sendNotification(data: any) {
    this.logOperation('sendNotification', data)
    // Implementation will be added
    return { id: '1', ...data, status: 'sent' }
  }

  async getNotificationHistory(deviceId?: string, options?: any) {
    this.logOperation('getNotificationHistory', { deviceId, options })
    // Implementation will be added
    return { notifications: [], totalCount: 0 }
  }

  async exportNotificationHistory(filters: any, format: string) {
    this.logOperation('exportNotificationHistory', { filters, format })
    // Implementation will be added
    return format === 'csv' ? 'csv,data' : JSON.stringify([])
  }

  async clearNotificationHistory(olderThan?: Date) {
    this.logOperation('clearNotificationHistory', olderThan)
    // Implementation will be added
    return 0
  }
}
EOF

    cat > src/services/notifications/FilteringService.ts << 'EOF'
import { BaseService } from '../base/BaseService'

export class FilteringService extends BaseService {
  async getFilters() {
    this.logOperation('getFilters')
    // Implementation will be added
    return []
  }

  async createFilter(data: any) {
    this.logOperation('createFilter', data)
    // Implementation will be added
    return { id: '1', ...data }
  }

  async updateFilter(id: string, updates: any) {
    this.logOperation('updateFilter', { id, updates })
    // Implementation will be added
    return { id, ...updates }
  }

  async deleteFilter(id: string) {
    this.logOperation('deleteFilter', id)
    // Implementation will be added
    return true
  }

  async applyFilters(notification: any) {
    this.logOperation('applyFilters', notification)
    // Implementation will be added
    return true
  }
}
EOF

    cat > src/services/notifications/QueueService.ts << 'EOF'
import { BaseService } from '../base/BaseService'

export class QueueService extends BaseService {
  async enqueue(notification: any) {
    this.logOperation('enqueue', notification)
    // Implementation will be added
    return true
  }

  async dequeue() {
    this.logOperation('dequeue')
    // Implementation will be added
    return null
  }

  async getQueueSize() {
    this.logOperation('getQueueSize')
    // Implementation will be added
    return 0
  }

  async clearQueue() {
    this.logOperation('clearQueue')
    // Implementation will be added
    return 0
  }
}
EOF

    cat > src/services/notifications/DeliveryService.ts << 'EOF'
import { BaseService } from '../base/BaseService'

export class DeliveryService extends BaseService {
  async deliverNotification(notification: any, device: any) {
    this.logOperation('deliverNotification', { notification, device })
    // Implementation will be added
    return { success: true, deliveredAt: new Date() }
  }

  async retryDelivery(notificationId: string) {
    this.logOperation('retryDelivery', notificationId)
    // Implementation will be added
    return { success: true, retryCount: 1 }
  }

  async getDeliveryStatus(notificationId: string) {
    this.logOperation('getDeliveryStatus', notificationId)
    // Implementation will be added
    return { status: 'delivered', attempts: 1 }
  }
}
EOF

    log_substep "Creating device services..."
    
    cat > src/services/devices/DeviceService.ts << 'EOF'
import { BaseService } from '../base/BaseService'

export class DeviceService extends BaseService {
  async getDevices(options: any) {
    this.logOperation('getDevices', options)
    // Implementation will be added
    return { devices: [], totalCount: 0 }
  }

  async getDeviceById(id: string) {
    this.logOperation('getDeviceById', id)
    // Implementation will be added
    return { id, name: 'Test Device', status: 'online' }
  }

  async createDevice(data: any) {
    this.logOperation('createDevice', data)
    // Implementation will be added
    return { id: '1', ...data, createdAt: new Date() }
  }

  async updateDevice(id: string, updates: any) {
    this.logOperation('updateDevice', { id, updates })
    // Implementation will be added
    return { id, ...updates, updatedAt: new Date() }
  }

  async deleteDevice(id: string) {
    this.logOperation('deleteDevice', id)
    // Implementation will be added
    return true
  }

  async testConnection(id: string) {
    this.logOperation('testConnection', id)
    // Implementation will be added
    return { connected: true, latency: 50 }
  }
}
EOF

    cat > src/services/devices/RegistrationService.ts << 'EOF'
import { BaseService } from '../base/BaseService'

export class RegistrationService extends BaseService {
  async registerDevice(data: any) {
    this.logOperation('registerDevice', data)
    // Implementation will be added
    return { id: '1', ...data, registeredAt: new Date() }
  }

  async generateRegistrationQR() {
    this.logOperation('generateRegistrationQR')
    // Implementation will be added
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  }

  async verifyRegistration(token: string) {
    this.logOperation('verifyRegistration', token)
    // Implementation will be added
    return { valid: true, deviceId: '1' }
  }

  async revokeRegistration(deviceId: string) {
    this.logOperation('revokeRegistration', deviceId)
    // Implementation will be added
    return true
  }
}
EOF

    cat > src/services/devices/DiscoveryService.ts << 'EOF'
import { BaseService } from '../base/BaseService'

export class DiscoveryService extends BaseService {
  async startDiscovery() {
    this.logOperation('startDiscovery')
    // Implementation will be added
    return true
  }

  async stopDiscovery() {
    this.logOperation('stopDiscovery')
    // Implementation will be added
    return true
  }

  async getDiscoveredDevices() {
    this.logOperation('getDiscoveredDevices')
    // Implementation will be added
    return []
  }

  async isDiscoveryActive() {
    this.logOperation('isDiscoveryActive')
    // Implementation will be added
    return false
  }
}
EOF

    cat > src/services/devices/ConnectionService.ts << 'EOF'
import { BaseService } from '../base/BaseService'

export class ConnectionService extends BaseService {
  async establishConnection(deviceId: string) {
    this.logOperation('establishConnection', deviceId)
    // Implementation will be added
    return { success: true, connectionId: 'conn_1' }
  }

  async closeConnection(deviceId: string) {
    this.logOperation('closeConnection', deviceId)
    // Implementation will be added
    return true
  }

  async getConnectionStatus(deviceId: string) {
    this.logOperation('getConnectionStatus', deviceId)
    // Implementation will be added
    return { status: 'connected', lastSeen: new Date() }
  }

  async getActiveConnections() {
    this.logOperation('getActiveConnections')
    // Implementation will be added
    return []
  }
}
EOF

    log_substep "Creating auth services..."
    
    cat > src/services/auth/AuthService.ts << 'EOF'
import { BaseService } from '../base/BaseService'

export class AuthService extends BaseService {
  async login(username: string, password: string) {
    this.logOperation('login', { username })
    // Implementation will be added
    return {
      token: 'jwt_token_here',
      refreshToken: 'refresh_token_here',
      user: { id: '1', username }
    }
  }

  async logout(token: string) {
    this.logOperation('logout')
    // Implementation will be added
    return true
  }

  async refreshToken(refreshToken: string) {
    this.logOperation('refreshToken')
    // Implementation will be added
    return {
      token: 'new_jwt_token',
      refreshToken: 'new_refresh_token'
    }
  }

  async verifyToken(token: string) {
    this.logOperation('verifyToken')
    // Implementation will be added
    return { id: '1', username: 'user' }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    this.logOperation('changePassword', { userId })
    // Implementation will be added
    return true
  }
}
EOF

    cat > src/services/auth/TokenService.ts << 'EOF'
import { BaseService } from '../base/BaseService'

export class TokenService extends BaseService {
  async generateApiToken(name: string, permissions: string[]) {
    this.logOperation('generateApiToken', { name, permissions })
    // Implementation will be added
    return {
      id: '1',
      name,
      token: 'api_token_here',
      permissions,
      createdAt: new Date()
    }
  }

  async revokeToken(id: string) {
    this.logOperation('revokeToken', id)
    // Implementation will be added
    return true
  }

  async listTokens() {
    this.logOperation('listTokens')
    // Implementation will be added
    return []
  }

  async validateApiToken(token: string) {
    this.logOperation('validateApiToken')
    // Implementation will be added
    return { valid: true, permissions: ['read', 'write'] }
  }
}
EOF

    cat > src/services/auth/CryptoService.ts << 'EOF'
import { BaseService } from '../base/BaseService'

export class CryptoService extends BaseService {
  async hashPassword(password: string) {
    this.logOperation('hashPassword')
    // Implementation will be added
    return 'hashed_password'
  }

  async verifyPassword(password: string, hash: string) {
    this.logOperation('verifyPassword')
    // Implementation will be added
    return true
  }

  async encrypt(data: string) {
    this.logOperation('encrypt')
    // Implementation will be added
    return 'encrypted_data'
  }

  async decrypt(encryptedData: string) {
    this.logOperation('decrypt')
    // Implementation will be added
    return 'decrypted_data'
  }

  async generateSecureToken() {
    this.logOperation('generateSecureToken')
    // Implementation will be added
    return 'secure_token_' + Date.now()
  }
}
EOF

    log_substep "Creating system services..."
    
    cat > src/services/system/HealthService.ts << 'EOF'
import { BaseService } from '../base/BaseService'

export class HealthService extends BaseService {
  async getSystemHealth() {
    this.logOperation('getSystemHealth')
    // Implementation will be added
    return {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date()
    }
  }

  async getReadiness() {
    this.logOperation('getReadiness')
    // Implementation will be added
    return {
      ready: true,
      checks: {
        database: true,
        services: true
      }
    }
  }

  async getLiveness() {
    this.logOperation('getLiveness')
    // Implementation will be added
    return {
      alive: true,
      timestamp: new Date()
    }
  }

  async performHealthCheck() {
    this.logOperation('performHealthCheck')
    // Implementation will be added
    return {
      overall: 'healthy',
      components: {
        database: 'healthy',
        webserver: 'healthy',
        websocket: 'healthy'
      }
    }
  }
}
EOF

    cat > src/services/system/MetricsService.ts << 'EOF'
import { BaseService } from '../base/BaseService'

export class MetricsService extends BaseService {
  async getSystemMetrics() {
    this.logOperation('getSystemMetrics')
    // Implementation will be added
    return {
      cpu: 25.5,
      memory: 512,
      disk: 75.2,
      network: {
        bytesIn: 1024,
        bytesOut: 2048
      }
    }
  }

  async getPerformanceMetrics(timeRange: string) {
    this.logOperation('getPerformanceMetrics', timeRange)
    // Implementation will be added
    return {
      averageResponseTime: 150,
      requestsPerSecond: 25,
      errorRate: 0.1
    }
  }

  async getUsageStatistics() {
    this.logOperation('getUsageStatistics')
    // Implementation will be added
    return {
      totalNotifications: 1500,
      activeDevices: 5,
      uptime: '2 days'
    }
  }

  async recordMetric(name: string, value: number) {
    this.logOperation('recordMetric', { name, value })
    // Implementation will be added
    return true
  }
}
EOF

    cat > src/services/config/ConfigService.ts << 'EOF'
import { BaseService } from '../base/BaseService'

export class ConfigService extends BaseService {
  async getConfiguration() {
    this.logOperation('getConfiguration')
    // Implementation will be added
    return {
      notifications: {
        enabled: true,
        retryAttempts: 3,
        timeout: 30000
      },
      security: {
        authRequired: true,
        tokenExpiry: '24h'
      }
    }
  }

  async updateConfiguration(updates: any) {
    this.logOperation('updateConfiguration', updates)
    // Implementation will be added
    return updates
  }

  async resetToDefaults() {
    this.logOperation('resetToDefaults')
    // Implementation will be added
    return true
  }

  async validateConfiguration(config: any) {
    this.logOperation('validateConfiguration', config)
    // Implementation will be added
    return { valid: true, errors: [] }
  }
}
EOF

    cat > src/services/index.ts << 'EOF'
export * from './base/BaseService'
export * from './notifications/NotificationService'
export * from './notifications/FilteringService'
export * from './notifications/QueueService'
export * from './notifications/DeliveryService'
export * from './devices/DeviceService'
export * from './devices/RegistrationService'
export * from './devices/DiscoveryService'
export * from './devices/ConnectionService'
export * from './auth/AuthService'
export * from './auth/TokenService'
export * from './auth/CryptoService'
export * from './system/HealthService'
export * from './system/MetricsService'
export * from './config/ConfigService'
EOF

    log_success "Service layer created"
}

# Main execution
main() {
    print_header
    
    validate_environment
    create_main_files
    create_config_layer
    create_controller_layer
    create_service_layer
    
    echo
    echo -e "${BOLD}${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${GREEN}║             🎉 BACKEND STUBS CREATED! 🎉                  ║${NC}"
    echo -e "${BOLD}${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo
    log_success "Backend stub files created successfully"
    echo
    log_info "Next: Run the script to continue creating remaining layers..."
    echo
}

# Execute main function
main "$@"