# BeepMyPhone Backend Architecture Guide

This document defines the architectural principles, design patterns, and code quality standards for the BeepMyPhone backend system. All code must adhere to these guidelines to ensure maintainability, scalability, and quality.

## 🏗️ SOLID Principles Implementation

### **1. Single Responsibility Principle (SRP)**

**Definition**: Each class should have only one reason to change and should handle only one responsibility.

#### **✅ Correct Implementation**

```typescript
// ✅ GOOD: Single responsibility - only handles Windows notification monitoring
class WindowsNotificationMonitor {
  private listener?: UserNotificationListener;
  
  public async startMonitoring(): Promise<void> {
    this.listener = new UserNotificationListener();
    await this.listener.start();
  }
  
  public async stopMonitoring(): Promise<void> {
    await this.listener?.stop();
  }
  
  public onNotificationReceived(callback: (notification: Notification) => void): void {
    this.listener?.onNotificationReceived(callback);
  }
}

// ✅ GOOD: Single responsibility - only handles notification forwarding
class NotificationForwarder {
  constructor(private socketServer: SocketServer) {}
  
  public async forwardToDevices(notification: Notification, devices: Device[]): Promise<void> {
    const promises = devices.map(device => 
      this.socketServer.sendToDevice(device.id, notification)
    );
    await Promise.all(promises);
  }
}
```

#### **❌ Incorrect Implementation**

```typescript
// ❌ BAD: Multiple responsibilities (monitoring, filtering, forwarding, storage)
class NotificationManager {
  private listener?: UserNotificationListener;
  private deviceRepository: DeviceRepository;
  private socketServer: SocketServer;
  
  public async processNotification(data: any): Promise<void> {
    // Monitoring responsibility
    const notification = this.parseNotification(data);
    
    // Filtering responsibility  
    if (this.shouldFilter(notification)) return;
    
    // Storage responsibility
    await this.saveToDatabase(notification);
    
    // Forwarding responsibility
    const devices = await this.deviceRepository.getActiveDevices();
    await this.forwardToAllDevices(notification, devices);
    
    // Logging responsibility
    console.log(`Processed notification: ${notification.title}`);
  }
}
```

#### **Enforcement Rule**
- **Maximum 5 public methods per class**
- **Classes must have a single, clear responsibility stated in their name**
- **If a class name contains "Manager", "Handler", or "Service", review for SRP violations**

---

### **2. Open/Closed Principle (OCP)**

**Definition**: Classes should be open for extension but closed for modification.

#### **✅ Correct Implementation**

```typescript
// ✅ GOOD: Abstract base class open for extension
abstract class NotificationMonitor {
  protected eventEmitter: EventEmitter;
  
  constructor() {
    this.eventEmitter = new EventEmitter();
  }
  
  abstract startMonitoring(): Promise<void>;
  abstract stopMonitoring(): Promise<void>;
  
  protected emitNotification(notification: Notification): void {
    this.eventEmitter.emit('notification', notification);
  }
  
  public onNotification(callback: (notification: Notification) => void): void {
    this.eventEmitter.on('notification', callback);
  }
}

// ✅ GOOD: Extension without modification
class LinuxNotificationMonitor extends NotificationMonitor {
  private dbusClient?: DBusClient;
  
  async startMonitoring(): Promise<void> {
    this.dbusClient = new DBusClient();
    await this.dbusClient.connect();
    this.dbusClient.on('notification', (data) => {
      const notification = this.parseDbusNotification(data);
      this.emitNotification(notification);
    });
  }
  
  async stopMonitoring(): Promise<void> {
    await this.dbusClient?.disconnect();
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
      this.startWindowsMonitoring();
    } else if (platform === 'linux') {
      // Linux logic
      this.startLinuxMonitoring();
    } else if (platform === 'macos') {  // Need to modify this method for new platforms
      // macOS logic
      this.startMacOSMonitoring();
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
interface DeviceConnection {
  connect(device: Device): Promise<void>;
  disconnect(device: Device): Promise<void>;
  sendNotification(device: Device, notification: Notification): Promise<boolean>;
  isConnected(device: Device): boolean;
}

class WebSocketConnection implements DeviceConnection {
  async connect(device: Device): Promise<void> {
    if (this.isConnected(device)) {
      throw new Error('Device already connected');
    }
    await this.establishWebSocketConnection(device);
  }
  
  async sendNotification(device: Device, notification: Notification): Promise<boolean> {
    if (!this.isConnected(device)) {
      throw new Error('Device not connected');
    }
    return await this.sendViaWebSocket(device, notification);
  }
  
  isConnected(device: Device): boolean {
    return this.getConnection(device)?.readyState === WebSocket.OPEN;
  }
}

class HTTPConnection implements DeviceConnection {
  async connect(device: Device): Promise<void> {
    if (this.isConnected(device)) {
      throw new Error('Device already connected');
    }
    await this.testHttpConnection(device);
  }
  
  async sendNotification(device: Device, notification: Notification): Promise<boolean> {
    if (!this.isConnected(device)) {
      throw new Error('Device not connected');
    }
    return await this.sendViaHttp(device, notification);
  }
  
  isConnected(device: Device): boolean {
    return this.canReachDevice(device);
  }
}
```

#### **❌ Incorrect Implementation**

```typescript
// ❌ BAD: Subclass changes expected behavior
class UnreliableConnection implements DeviceConnection {
  async sendNotification(device: Device, notification: Notification): Promise<boolean> {
    // BAD: Doesn't throw error when device not connected, violates LSP
    if (this.isConnected(device)) {
      return await this.attemptSend(device, notification);
    }
    return false; // Silently fails - violates expected behavior
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
  getNotificationById(id: string): Promise<Notification>;
}

interface NotificationWriter {
  saveNotification(notification: Notification): Promise<void>;
  updateNotification(id: string, data: Partial<Notification>): Promise<void>;
}

interface NotificationDeleter {
  deleteNotification(id: string): Promise<void>;
  deleteOldNotifications(olderThan: Date): Promise<number>;
}

// Client only implements what it needs
class NotificationHistoryService implements NotificationReader {
  constructor(private repository: NotificationRepository) {}
  
  async getNotifications(): Promise<Notification[]> {
    return await this.repository.findAll();
  }
  
  async getNotificationById(id: string): Promise<Notification> {
    const notification = await this.repository.findById(id);
    if (!notification) {
      throw new Error(`Notification ${id} not found`);
    }
    return notification;
  }
}
```

#### **❌ Incorrect Implementation**

```typescript
// ❌ BAD: Fat interface forces unnecessary dependencies
interface NotificationService {
  // Read operations
  getNotifications(): Promise<Notification[]>;
  getNotificationById(id: string): Promise<Notification>;
  
  // Write operations  
  saveNotification(notification: Notification): Promise<void>;
  updateNotification(id: string, data: Partial<Notification>): Promise<void>;
  
  // Delete operations
  deleteNotification(id: string): Promise<void>;
  deleteOldNotifications(olderThan: Date): Promise<number>;
  
  // Monitoring operations
  startMonitoring(): Promise<void>;
  stopMonitoring(): Promise<void>;
  
  // Forwarding operations
  forwardToDevices(notification: Notification): Promise<void>;
}

// BAD: Forced to implement methods it doesn't need
class ReadOnlyNotificationService implements NotificationService {
  // Must implement but doesn't need these methods
  async saveNotification(): Promise<void> {
    throw new Error('Read-only service cannot save');
  }
  
  async deleteNotification(): Promise<void> {
    throw new Error('Read-only service cannot delete');
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
  findActiveDevices(): Promise<Device[]>;
}

interface NotificationQueue {
  enqueue(notification: QueuedNotification): Promise<void>;
  dequeue(): Promise<QueuedNotification | null>;
  getQueueSize(): Promise<number>;
}

class NotificationForwardingService {
  constructor(
    private deviceRepository: DeviceRepository,  // Abstraction
    private notificationQueue: NotificationQueue, // Abstraction
    private connectionManager: DeviceConnection   // Abstraction
  ) {}
  
  async processNotification(notification: Notification): Promise<void> {
    const devices = await this.deviceRepository.findActiveDevices();
    
    for (const device of devices) {
      const queuedNotification = new QueuedNotification(notification, device.id);
      await this.notificationQueue.enqueue(queuedNotification);
    }
  }
}
```

#### **❌ Incorrect Implementation**

```typescript
// ❌ BAD: Depends on concrete implementations
import { SQLiteDeviceRepository } from './SQLiteDeviceRepository';
import { InMemoryNotificationQueue } from './InMemoryNotificationQueue';
import { WebSocketConnection } from './WebSocketConnection';

class NotificationForwardingService {
  private deviceRepository = new SQLiteDeviceRepository(); // Concrete dependency
  private queue = new InMemoryNotificationQueue();        // Concrete dependency
  private connection = new WebSocketConnection();         // Concrete dependency
  
  async processNotification(notification: Notification): Promise<void> {
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
  private config: BeepMyPhoneConfig;
  
  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }
  
  public get<T>(key: keyof BeepMyPhoneConfig): T {
    return this.config[key] as T;
  }
  
  public getServerPort(): number {
    return this.get<number>('serverPort') || 3000;
  }
  
  public getWebSocketPort(): number {
    return this.get<number>('webSocketPort') || 3001;
  }
}

// Usage: Single source of truth
const httpPort = ConfigService.getInstance().getServerPort();
const wsPort = ConfigService.getInstance().getWebSocketPort();
```

#### **Error Handling**

```typescript
// ✅ GOOD: Reusable error handling
abstract class BaseController {
  protected handleError(error: Error, res: Response): void {
    if (error instanceof ValidationError) {
      res.status(400).json({ 
        error: 'Invalid request data', 
        details: error.message 
      });
    } else if (error instanceof DeviceNotFoundError) {
      res.status(404).json({ 
        error: 'Device not found', 
        deviceId: error.deviceId 
      });
    } else if (error instanceof ConnectionError) {
      res.status(503).json({ 
        error: 'Service temporarily unavailable', 
        message: error.message 
      });
    } else {
      console.error('Unexpected error:', error);
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
      this.handleError(error as Error, res); // Reuse error handling
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
  if (data.platform === 'windows') {
    if (data.type === 'toast') {
      if (data.priority === 'high') {
        if (data.devices && data.devices.length > 0) {
          for (const device of data.devices) {
            if (device.connected && device.preferences) {
              if (device.preferences.allowHighPriority) {
                // 50 lines of nested notification logic
                sendToDevice(device, processWindowsToast(data));
              }
            }
          }
        }
      }
    }
  } else if (data.platform === 'linux') {
    // Another 50 lines of nested logic
  }
}
```

#### **✅ Clean Alternative**
```typescript
// ✅ GOOD: Clear, single-purpose functions
class NotificationProcessor {
  constructor(
    private monitorFactory: NotificationMonitorFactory,
    private forwarder: NotificationForwarder,
    private deviceFilter: DeviceFilter
  ) {}
  
  public async process(rawNotification: RawNotificationData): Promise<void> {
    const notification = this.parseNotification(rawNotification);
    
    if (!this.shouldProcess(notification)) {
      return;
    }
    
    const eligibleDevices = await this.getEligibleDevices(notification);
    await this.forwarder.forwardToDevices(notification, eligibleDevices);
  }
  
  private parseNotification(raw: RawNotificationData): Notification {
    const parser = this.monitorFactory.getParser(raw.platform);
    return parser.parse(raw);
  }
  
  private shouldProcess(notification: Notification): boolean {
    return this.deviceFilter.shouldForward(notification);
  }
  
  private async getEligibleDevices(notification: Notification): Promise<Device[]> {
    const devices = await this.deviceRepository.findActiveDevices();
    return this.deviceFilter.filterByPreferences(devices, notification);
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
  "max-classes-per-file": ["error", 1],
  "no-duplicate-string": ["error", 3]
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
  constructor(private database: Database) {}
  
  async save(device: Device): Promise<void> {
    const sql = 'INSERT OR REPLACE INTO devices (id, name, type, token) VALUES (?, ?, ?, ?)';
    await this.database.run(sql, [device.id, device.name, device.type, device.token]);
  }
  
  async findById(id: string): Promise<Device | null> {
    const sql = 'SELECT * FROM devices WHERE id = ?';
    const row = await this.database.get(sql, [id]);
    return row ? Device.fromRow(row) : null;
  }
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
      case Platform.Windows: 
        return new WindowsNotificationMonitor();
      case Platform.Linux: 
        return new LinuxNotificationMonitor();
      case Platform.MacOS: 
        return new MacOSNotificationMonitor();
      default: 
        throw new Error(`Unsupported platform: ${platform}`);
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
  
  public unsubscribe(observer: NotificationObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
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
interface ForwardingStrategy {
  forward(notification: Notification, device: Device): Promise<boolean>;
}

class WebSocketForwardingStrategy implements ForwardingStrategy {
  async forward(notification: Notification, device: Device): Promise<boolean> {
    return await this.sendViaWebSocket(notification, device);
  }
}

class HTTPForwardingStrategy implements ForwardingStrategy {
  async forward(notification: Notification, device: Device): Promise<boolean> {
    return await this.sendViaHttp(notification, device);
  }
}

class ForwardingContext {
  constructor(private strategy: ForwardingStrategy) {}
  
  public setStrategy(strategy: ForwardingStrategy): void {
    this.strategy = strategy;
  }
  
  public async execute(notification: Notification, device: Device): Promise<boolean> {
    return await this.strategy.forward(notification, device);
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
  readonly token?: string;
}

interface DeviceCapabilities {
  readonly supportsWebSocket: boolean;
  readonly supportsHttp: boolean;
  readonly maxNotificationSize: number;
}

class DeviceService {
  public async createDevice(request: CreateDeviceRequest): Promise<Device> {
    // TypeScript ensures type safety
    const device = new Device({
      id: this.generateId(),
      name: request.name,
      type: request.type,
      capabilities: request.capabilities,
      token: request.token || this.generateToken()
    });
    
    await this.deviceRepository.save(device);
    return device;
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
  readonly source: NotificationSource;
  readonly metadata: Readonly<Record<string, unknown>>;
}

interface NotificationSource {
  readonly appName: string;
  readonly platform: Platform;
  readonly icon?: string;
}

// ✅ GOOD: Immutable updates
class Notification {
  constructor(private readonly data: NotificationData) {}
  
  public withUpdatedBody(body: string): Notification {
    return new Notification({
      ...this.data,
      body,
      timestamp: new Date()
    });
  }
  
  public withMetadata(metadata: Record<string, unknown>): Notification {
    return new Notification({
      ...this.data,
      metadata: { ...this.data.metadata, ...metadata }
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

class ConnectionError extends Error {
  constructor(
    public readonly deviceId: string, 
    public readonly reason: string
  ) {
    super(`Connection failed for device ${deviceId}: ${reason}`);
    this.name = 'ConnectionError';
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
      const device = await this.deviceRepository.findById(id);
      if (!device) {
        return { success: false, error: new DeviceNotFoundError(id) };
      }
      return { success: true, data: device };
    } catch (error) {
      return { 
        success: false, 
        error: new DeviceNotFoundError(id) 
      };
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
- **Notification latency**: < 100ms from capture to forward
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
    "@typescript-eslint/prefer-readonly": "error",
    "no-duplicate-string": ["error", 3]
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
  },
  "lint-staged": {
    "*.ts": ["eslint --fix", "prettier --write"]
  }
}
```

---

## 📝 Documentation Standards

### **1. Code Documentation**

```typescript
/**
 * Service responsible for managing notification forwarding to mobile devices.
 * 
 * Implements secure device communication and notification queuing following
 * the local-first architecture defined in IMPLEMENTATION_PLAN.md.
 * 
 * @example
 * ```typescript
 * const forwarder = new NotificationForwardingService(
 *   deviceRepository, 
 *   socketServer, 
 *   encryptionService
 * );
 * 
 * await forwarder.forwardNotification(notification, devices);
 * ```
 */
class NotificationForwardingService {
  /**
   * Forwards notification to specified devices with encryption and retry logic.
   * 
   * @param notification - Notification data to forward
   * @param devices - Target devices for notification delivery
   * @returns Promise resolving to delivery results per device
   * @throws {ValidationError} When notification data is invalid
   * @throws {ConnectionError} When device connections fail
   */
  public async forwardNotification(
    notification: Notification, 
    devices: Device[]
  ): Promise<DeliveryResult[]> {
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