# BeepMyPhone Backend Architecture Guide

This document defines the architectural principles, design patterns, and code quality standards for the BeepMyPhone backend system. All code must adhere to these guidelines to ensure maintainability, scalability, and quality.

## 🏗️ SOLID Principles Implementation

### **1. Single Responsibility Principle (SRP)**

**Definition**: Each class should have only one reason to change and should handle only one responsibility.

#### **✅ Correct Implementation**

```typescript
// ✅ GOOD: Single responsibility - only handles notification filtering
class NotificationFilterService {
  private rules: FilterRule[] = [];
  
  public addRule(rule: FilterRule): void {
    this.rules.push(rule);
  }
  
  public shouldFilter(notification: Notification): boolean {
    return this.rules.some(rule => rule.matches(notification));
  }
}

// ✅ GOOD: Single responsibility - only handles notification delivery
class NotificationDeliveryService {
  constructor(private transport: NotificationTransport) {}
  
  public async deliver(notification: Notification, device: Device): Promise<void> {
    await this.transport.send(notification, device);
  }
}
```

#### **❌ Incorrect Implementation**

```typescript
// ❌ BAD: Multiple responsibilities (filtering, delivery, logging, validation)
class NotificationManager {
  public async processNotification(notification: any, device: any): Promise<void> {
    // Validation responsibility
    if (!notification.title) throw new Error('Invalid notification');
    
    // Filtering responsibility  
    if (this.shouldFilter(notification)) return;
    
    // Logging responsibility
    console.log(`Sending notification: ${notification.title}`);
    
    // Delivery responsibility
    await this.sendToDevice(notification, device);
    
    // Analytics responsibility
    this.updateDeliveryStats();
  }
}
```

#### **Enforcement Rule**
- **Maximum 5 public methods per class**
- **Classes must have a single, clear responsibility stated in their name**
- **If a class name contains "And", "Manager", or "Handler", review for SRP violations**

---

### **2. Open/Closed Principle (OCP)**

**Definition**: Classes should be open for extension but closed for modification.

#### **✅ Correct Implementation**

```typescript
// ✅ GOOD: Abstract base class open for extension
abstract class NotificationMonitor {
  protected filterService: NotificationFilterService;
  
  constructor(filterService: NotificationFilterService) {
    this.filterService = filterService;
  }
  
  abstract startMonitoring(): Promise<void>;
  abstract stopMonitoring(): Promise<void>;
  
  protected processNotification(notification: Notification): void {
    if (!this.filterService.shouldFilter(notification)) {
      this.onNotificationReceived(notification);
    }
  }
  
  protected abstract onNotificationReceived(notification: Notification): void;
}

// ✅ GOOD: Extension without modification
class WindowsNotificationMonitor extends NotificationMonitor {
  private listener?: UserNotificationListener;
  
  async startMonitoring(): Promise<void> {
    this.listener = new UserNotificationListener();
    await this.listener.start(notification => 
      this.processNotification(notification)
    );
  }
  
  async stopMonitoring(): Promise<void> {
    await this.listener?.stop();
  }
  
  protected onNotificationReceived(notification: Notification): void {
    // Windows-specific handling
    this.emit('notification', notification);
  }
}
```

#### **❌ Incorrect Implementation**

```typescript
// ❌ BAD: Must modify existing code to add new platforms
class NotificationMonitor {
  public startMonitoring(platform: string): void {
    if (platform === 'windows') {
      // Windows logic
    } else if (platform === 'linux') {
      // Linux logic  
    } else if (platform === 'macos') {  // Need to modify this method
      // macOS logic
    }
  }
}
```

#### **Enforcement Rule**
- **Use abstract base classes and interfaces for extensibility**
- **Avoid switch/if-else chains based on type checking**
- **New functionality should extend existing classes, not modify them**

---

### **3. Liskov Substitution Principle (LSP)**

**Definition**: Objects of a superclass should be replaceable with objects of subclasses without breaking functionality.

#### **✅ Correct Implementation**

```typescript
// ✅ GOOD: All implementations maintain the same contract
interface NotificationTransport {
  send(notification: Notification, device: Device): Promise<void>;
  isConnected(device: Device): boolean;
}

class WebSocketTransport implements NotificationTransport {
  async send(notification: Notification, device: Device): Promise<void> {
    if (!this.isConnected(device)) {
      throw new Error('Device not connected');
    }
    await this.sendViaWebSocket(notification, device);
  }
  
  isConnected(device: Device): boolean {
    return this.getConnection(device)?.connected === true;
  }
}

class HttpTransport implements NotificationTransport {
  async send(notification: Notification, device: Device): Promise<void> {
    if (!this.isConnected(device)) {
      throw new Error('Device not connected');
    }
    await this.sendViaHttp(notification, device);
  }
  
  isConnected(device: Device): boolean {
    return this.canReachDevice(device);
  }
}
```

#### **❌ Incorrect Implementation**

```typescript
// ❌ BAD: Subclass changes expected behavior
class UnreliableTransport implements NotificationTransport {
  async send(notification: Notification, device: Device): Promise<void> {
    // BAD: Doesn't throw error when device not connected
    if (this.isConnected(device)) {
      await this.sendNotification(notification, device);
    }
    // Silently fails - violates LSP
  }
}
```

#### **Enforcement Rule**
- **Subclasses must honor the contracts of their parent class/interface**
- **Exception types and preconditions must not be strengthened in subclasses**
- **Postconditions must not be weakened in subclasses**

---

### **4. Interface Segregation Principle (ISP)**

**Definition**: Clients should not be forced to depend on interfaces they don't use.

#### **✅ Correct Implementation**

```typescript
// ✅ GOOD: Segregated interfaces
interface NotificationReader {
  getNotifications(): Promise<Notification[]>;
  getNotification(id: string): Promise<Notification>;
}

interface NotificationWriter {
  createNotification(notification: CreateNotificationDto): Promise<Notification>;
  updateNotification(id: string, data: UpdateNotificationDto): Promise<void>;
}

interface NotificationDeleter {
  deleteNotification(id: string): Promise<void>;
  deleteAllNotifications(): Promise<void>;
}

// Client only implements what it needs
class NotificationHistoryService implements NotificationReader {
  async getNotifications(): Promise<Notification[]> {
    return await this.repository.findAll();
  }
  
  async getNotification(id: string): Promise<Notification> {
    return await this.repository.findById(id);
  }
}
```

#### **❌ Incorrect Implementation**

```typescript
// ❌ BAD: Fat interface forces unnecessary dependencies
interface NotificationService {
  // Read operations
  getNotifications(): Promise<Notification[]>;
  getNotification(id: string): Promise<Notification>;
  
  // Write operations  
  createNotification(data: CreateNotificationDto): Promise<Notification>;
  updateNotification(id: string, data: UpdateNotificationDto): Promise<void>;
  
  // Delete operations
  deleteNotification(id: string): Promise<void>;
  deleteAllNotifications(): Promise<void>;
  
  // Monitoring operations
  startMonitoring(): Promise<void>;
  stopMonitoring(): Promise<void>;
  
  // Delivery operations
  deliverNotification(notification: Notification): Promise<void>;
}

// BAD: Forced to implement methods it doesn't need
class ReadOnlyNotificationService implements NotificationService {
  // Must implement but doesn't need these methods
  async createNotification(): Promise<Notification> {
    throw new Error('Not supported');
  }
  
  async deleteNotification(): Promise<void> {
    throw new Error('Not supported');
  }
  // ... more unused methods
}
```

#### **Enforcement Rule**
- **Interfaces should have maximum 5 methods**
- **Group related methods into cohesive interfaces**
- **Use composition over inheritance when combining interfaces**

---

### **5. Dependency Inversion Principle (DIP)**

**Definition**: High-level modules should not depend on low-level modules. Both should depend on abstractions.

#### **✅ Correct Implementation**

```typescript
// ✅ GOOD: Depends on abstractions
interface DeviceRepository {
  save(device: Device): Promise<void>;
  findById(id: string): Promise<Device | null>;
  findAll(): Promise<Device[]>;
}

interface NotificationQueue {
  enqueue(notification: QueuedNotification): Promise<void>;
  dequeue(): Promise<QueuedNotification | null>;
}

class DeviceService {
  constructor(
    private deviceRepository: DeviceRepository,  // Abstraction
    private notificationQueue: NotificationQueue // Abstraction
  ) {}
  
  async registerDevice(deviceData: CreateDeviceDto): Promise<Device> {
    const device = new Device(deviceData);
    await this.deviceRepository.save(device);
    
    const welcomeNotification = new QueuedNotification({
      deviceId: device.id,
      message: 'Welcome to BeepMyPhone!'
    });
    await this.notificationQueue.enqueue(welcomeNotification);
    
    return device;
  }
}
```

#### **❌ Incorrect Implementation**

```typescript
// ❌ BAD: Depends on concrete implementations
import { SqliteDeviceRepository } from './SqliteDeviceRepository';
import { InMemoryQueue } from './InMemoryQueue';

class DeviceService {
  private deviceRepository = new SqliteDeviceRepository(); // Concrete dependency
  private queue = new InMemoryQueue();                     // Concrete dependency
  
  async registerDevice(deviceData: CreateDeviceDto): Promise<Device> {
    // Tightly coupled to specific implementations
    // Hard to test and change
  }
}
```

#### **Enforcement Rule**
- **Use dependency injection for all external dependencies**
- **Constructor parameters must be interfaces or abstract classes**
- **Avoid `new` keyword in service classes except for value objects**

---

## 🔄 DRY Principle Guidelines

### **1. Code Duplication Prevention**

#### **Configuration Management**

```typescript
// ✅ GOOD: Centralized configuration
class ConfigService {
  private static instance: ConfigService;
  private config: ApplicationConfig;
  
  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }
  
  public get<T>(key: keyof ApplicationConfig): T {
    return this.config[key] as T;
  }
}

// Usage: Single source of truth
const port = ConfigService.getInstance().get<number>('port');
```

#### **Error Handling**

```typescript
// ✅ GOOD: Reusable error handling
abstract class BaseController {
  protected handleError(error: Error, res: Response): void {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

class DeviceController extends BaseController {
  async getDevice(req: Request, res: Response): Promise<void> {
    try {
      const device = await this.deviceService.getDevice(req.params.id);
      res.json(device);
    } catch (error) {
      this.handleError(error, res); // Reuse error handling
    }
  }
}
```

### **2. DRY Enforcement Rules**

- **Maximum code duplication**: 3 lines of identical code
- **Extract common functionality**: If logic appears 2+ times, create a shared function
- **Use utility classes**: Group related helper functions
- **Leverage TypeScript generics**: Avoid type-specific duplicated code

---

## 🚫 Anti-Pattern Prevention

### **1. No Spaghetti Code**

#### **❌ Spaghetti Code Example**
```typescript
// ❌ BAD: Complex, intertwined logic
function processNotification(data: any): void {
  if (data.type === 'email') {
    if (data.priority === 'high') {
      if (data.recipient && data.recipient.preferences) {
        if (data.recipient.preferences.emailNotifications) {
          // 50 lines of nested logic
        }
      }
    }
  } else if (data.type === 'sms') {
    // Another 50 lines of nested logic
  }
}
```

#### **✅ Clean Alternative**
```typescript
// ✅ GOOD: Clear, single-purpose functions
class NotificationProcessor {
  public process(notification: Notification): void {
    const handler = this.getHandler(notification.type);
    
    if (this.shouldProcess(notification)) {
      handler.handle(notification);
    }
  }
  
  private getHandler(type: NotificationType): NotificationHandler {
    return this.handlerFactory.create(type);
  }
  
  private shouldProcess(notification: Notification): boolean {
    return this.validator.isValid(notification) && 
           this.filter.allows(notification);
  }
}
```

### **2. No Monster Classes**

#### **Size Limits (Enforced)**
- **Maximum 200 lines per class**
- **Maximum 20 methods per class** 
- **Maximum 50 lines per method**
- **Maximum 5 parameters per method**
- **Maximum 10 class properties**

#### **Complexity Limits**
- **Maximum cyclomatic complexity: 10 per method**
- **Maximum nesting depth: 3 levels**
- **Maximum cognitive complexity: 15 per method**

### **3. Anti-Pattern Detection Rules**

```json
// ESLint rules to prevent anti-patterns
{
  "max-lines-per-function": ["error", 50],
  "max-params": ["error", 5],
  "max-depth": ["error", 3],
  "complexity": ["error", 10],
  "max-lines": ["error", 200],
  "max-classes-per-file": ["error", 1]
}
```

---

## 🎯 Design Patterns

### **1. Required Design Patterns**

#### **Repository Pattern**
```typescript
interface Repository<T> {
  save(entity: T): Promise<void>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  delete(id: string): Promise<void>;
}

class DeviceRepository implements Repository<Device> {
  // Implementation
}
```

#### **Factory Pattern**
```typescript
interface NotificationMonitorFactory {
  create(platform: Platform): NotificationMonitor;
}

class PlatformMonitorFactory implements NotificationMonitorFactory {
  create(platform: Platform): NotificationMonitor {
    switch (platform) {
      case Platform.Windows: return new WindowsNotificationMonitor();
      case Platform.Linux: return new LinuxNotificationMonitor();
      case Platform.MacOS: return new MacOSNotificationMonitor();
      default: throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}
```

#### **Observer Pattern**
```typescript
interface NotificationObserver {
  onNotificationReceived(notification: Notification): void;
}

class NotificationSubject {
  private observers: NotificationObserver[] = [];
  
  public subscribe(observer: NotificationObserver): void {
    this.observers.push(observer);
  }
  
  protected notify(notification: Notification): void {
    this.observers.forEach(observer => 
      observer.onNotificationReceived(notification)
    );
  }
}
```

#### **Strategy Pattern**
```typescript
interface DeliveryStrategy {
  deliver(notification: Notification, device: Device): Promise<void>;
}

class DeliveryContext {
  constructor(private strategy: DeliveryStrategy) {}
  
  public setStrategy(strategy: DeliveryStrategy): void {
    this.strategy = strategy;
  }
  
  public async execute(notification: Notification, device: Device): Promise<void> {
    await this.strategy.deliver(notification, device);
  }
}
```

### **2. Forbidden Patterns**

- **Singleton Pattern** (except for ConfigService)
- **God Object Pattern**
- **Anemic Domain Model**
- **Feature Envy**

---

## 🛠️ TypeScript Best Practices

### **1. Type Safety**

```typescript
// ✅ GOOD: Strict typing
interface CreateDeviceRequest {
  readonly name: string;
  readonly type: DeviceType;
  readonly capabilities: DeviceCapabilities;
}

class DeviceService {
  public async createDevice(request: CreateDeviceRequest): Promise<Device> {
    // TypeScript ensures type safety
    return new Device(request);
  }
}

// ❌ BAD: Any types
function createDevice(data: any): any {
  return new Device(data);
}
```

### **2. Immutability**

```typescript
// ✅ GOOD: Immutable data structures
interface NotificationData {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly timestamp: Date;
  readonly metadata: Readonly<Record<string, unknown>>;
}

// ✅ GOOD: Immutable updates
class NotificationState {
  public withUpdatedBody(body: string): NotificationState {
    return new NotificationState({
      ...this.data,
      body,
      timestamp: new Date()
    });
  }
}
```

### **3. Error Handling**

```typescript
// ✅ GOOD: Typed errors
class DeviceNotFoundError extends Error {
  constructor(public readonly deviceId: string) {
    super(`Device not found: ${deviceId}`);
    this.name = 'DeviceNotFoundError';
  }
}

// ✅ GOOD: Result pattern for error handling
type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

class DeviceService {
  public async getDevice(id: string): Promise<Result<Device, DeviceNotFoundError>> {
    try {
      const device = await this.repository.findById(id);
      if (!device) {
        return { success: false, error: new DeviceNotFoundError(id) };
      }
      return { success: true, data: device };
    } catch (error) {
      return { success: false, error: error as DeviceNotFoundError };
    }
  }
}
```

---

## 📊 Code Quality Standards

### **1. Automated Quality Gates**

#### **Test Coverage Requirements**
- **Minimum unit test coverage**: 90%
- **Minimum integration test coverage**: 80%
- **Critical path coverage**: 100%

#### **Code Quality Metrics**
- **Maintainability Index**: > 80
- **Cyclomatic Complexity**: < 10 per method
- **Cognitive Complexity**: < 15 per method
- **Technical Debt Ratio**: < 5%

### **2. Code Review Requirements**

#### **Mandatory Checks**
- [ ] SOLID principles adherence
- [ ] DRY principle compliance
- [ ] No anti-patterns present
- [ ] Proper error handling
- [ ] Comprehensive tests
- [ ] Type safety maintained
- [ ] Documentation updated

#### **Performance Requirements**
- **Memory usage**: < 100MB baseline
- **Response time**: < 200ms for API calls
- **Throughput**: > 100 notifications/second
- **CPU usage**: < 5% idle state

---

## 🔧 Enforcement Tools

### **1. Static Analysis Configuration**

```json
// tsconfig.json - Strict TypeScript settings
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### **2. ESLint Configuration**

```json
{
  "extends": ["@typescript-eslint/recommended"],
  "rules": {
    "max-lines-per-function": ["error", 50],
    "max-params": ["error", 5],
    "max-depth": ["error", 3],
    "complexity": ["error", 10],
    "max-classes-per-file": ["error", 1],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/prefer-readonly": "error"
  }
}
```

### **3. Pre-commit Hooks**

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged && npm run test:unit",
      "pre-push": "npm run test && npm run build"
    }
  }
}
```

---

## 📝 Documentation Standards

### **1. Code Documentation**

```typescript
/**
 * Service responsible for managing device registration and lifecycle.
 * 
 * Implements device pairing, authentication, and capability detection
 * following the secure registration flow defined in IMPLEMENTATION_PLAN.md.
 * 
 * @example
 * ```typescript
 * const deviceService = new DeviceService(deviceRepository, cryptoService);
 * const device = await deviceService.registerDevice({
 *   name: 'iPhone 14',
 *   type: DeviceType.iOS,
 *   capabilities: { supportsWebSocket: true }
 * });
 * ```
 */
class DeviceService {
  /**
   * Registers a new device with secure pairing process.
   * 
   * @param request - Device registration data
   * @returns Promise resolving to registered device with authentication tokens
   * @throws {ValidationError} When device data is invalid
   * @throws {DuplicateDeviceError} When device is already registered
   */
  public async registerDevice(request: CreateDeviceRequest): Promise<Device> {
    // Implementation
  }
}
```

### **2. Architecture Documentation Requirements**

- **All public APIs must have JSDoc comments**
- **Complex algorithms require inline comments explaining the approach**
- **Design decisions must be documented with rationale**
- **Performance considerations must be documented**

---

This architecture guide ensures the BeepMyPhone backend maintains high code quality, follows industry best practices, and remains maintainable and scalable throughout its development lifecycle. All code must comply with these standards before being merged to the main branch.