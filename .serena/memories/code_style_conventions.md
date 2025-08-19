# BeepMyPhone Code Style & Conventions

## TypeScript Configuration
- **Target**: ES2020
- **Module**: CommonJS (backend), ESM (frontend)
- **Strict Mode**: Enabled
- **Source Maps**: Enabled for debugging
- **Declaration Files**: Generated for libraries

## Naming Conventions
- **Files**: kebab-case (notification-service.ts)
- **Classes**: PascalCase (NotificationService)
- **Functions/Variables**: camelCase (sendNotification)
- **Constants**: UPPER_SNAKE_CASE (MAX_RETRY_COUNT)
- **Interfaces**: PascalCase with 'I' prefix (IDeviceConfig)
- **Types**: PascalCase (DeviceStatus)

## Project Structure Patterns
- **App Code**: All implementation in `/app/` subdirectories
- **Source**: `/src/` for implementation code
- **Tests**: `/tests/` for test files
- **Documentation**: `/docs/` for component documentation
- **Generated Code**: Uses Python generators in `/tools/`

## Architecture Principles
- **SOLID Principles**: Enforced across all components
- **DRY**: Don't repeat yourself
- **Clean Architecture**: Layered separation of concerns
- **Anti-patterns**: Explicitly documented and avoided
- **One Feature Per Objective**: Implementation plans limited to single features

## Code Organization
```
src/
├── controllers/     # Request handling
├── services/        # Business logic
├── models/          # Data structures
├── repositories/    # Data access
├── middleware/      # Request processing
├── routes/          # API endpoints
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── websocket/       # Real-time communication
```

## Testing Standards
- **Framework**: Jest with ts-jest
- **Coverage**: Collected from src/ directory
- **File Pattern**: *.test.ts or *.spec.ts
- **Location**: `/tests/` directory separate from `/src/`

## Documentation Requirements
- **README.md**: Feature analysis and requirements
- **IMPLEMENTATION_PLAN.md**: One feature per objective
- **PROJECT_STRUCTURE.md**: File organization
- **ARCHITECTURE.md**: SOLID principles
- **API_REFERENCE.md**: Interface documentation
- **CODE_EXAMPLES.md**: Implementation patterns