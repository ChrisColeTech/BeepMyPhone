# BeepMyPhone Frontend API Reference

This document provides comprehensive documentation for all React components, custom hooks, services, and TypeScript interfaces used in the BeepMyPhone frontend application, with complete SOLID principles compliance and architecture enforcement.

## 📋 Table of Contents

1. [Layout Components](#layout-components)
2. [UI Components](#ui-components)
3. [Feature Components](#feature-components)
4. [Custom Hooks](#custom-hooks)
5. [Services](#services)
6. [TypeScript Interfaces](#typescript-interfaces)
7. [Stores](#stores)
8. [Utilities](#utilities)

---

## 🏗️ Layout Components

### **AppLayout**

Root layout component that provides VS Code-style desktop application structure following Single Responsibility Principle.

```tsx
interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps>
```

**Single Responsibility:** Layout orchestration only - renders structure components without business logic.

**Usage:**
```tsx
<AppLayout>
  <Router />
</AppLayout>
```

**Features:**
- Renders title bar, sidebar, main content, and status bar components
- Handles layout state persistence through custom hooks
- Manages sidebar collapse/expand state delegation
- Maximum 100 lines, orchestration only

**Architecture Compliance:**
- ✅ SRP: Only handles layout structure
- ✅ Size Limit: Under 100 lines
- ✅ DIP: Depends on layout component abstractions

---

### **TitleBar**

Desktop application title bar with window controls and branding. Single responsibility: title display only.

```tsx
interface TitleBarProps {
  title?: string;
  showWindowControls?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

const TitleBar: React.FC<TitleBarProps>
```

**Props:**
- `title` (optional): Custom title text (default: "BeepMyPhone")
- `showWindowControls` (optional): Show minimize/maximize/close buttons (default: true)
- `onMinimize` (optional): Window minimize callback
- `onMaximize` (optional): Window maximize callback
- `onClose` (optional): Window close callback

**Usage:**
```tsx
<TitleBar 
  title="BeepMyPhone - Dashboard"
  onClose={handleWindowClose}
/>
```

**Architecture Compliance:**
- ✅ SRP: Only handles title display and window controls
- ✅ Size Limit: Maximum 50 lines
- ✅ ISP: Specific interface for title bar concerns only

---

### **Sidebar**

Collapsible navigation sidebar following Single Responsibility Principle.

```tsx
interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps>
```

**Props:**
- `collapsed` (optional): Controls sidebar collapsed state
- `onToggle` (optional): Callback when collapse state changes
- `className` (optional): Additional CSS classes

**Usage:**
```tsx
const { collapsed, toggle } = useSidebar();

<Sidebar 
  collapsed={collapsed}
  onToggle={toggle}
/>
```

**Architecture Compliance:**
- ✅ SRP: Only handles sidebar display and collapse behavior
- ✅ Size Limit: Maximum 100 lines
- ✅ OCP: Extensible through props without modification

---

### **Navigation**

Navigation menu component with active route indication. Single responsibility: menu rendering only.

```tsx
interface NavigationProps {
  collapsed?: boolean;
  activeRoute?: string;
  onRouteChange?: (route: string) => void;
}

const Navigation: React.FC<NavigationProps>
```

**Props:**
- `collapsed` (optional): Render in collapsed mode
- `activeRoute` (optional): Currently active route
- `onRouteChange` (optional): Route change callback

**Architecture Compliance:**
- ✅ SRP: Only handles navigation menu rendering
- ✅ Size Limit: Maximum 80 lines
- ✅ DRY: Reuses NavigationItem components

---

### **MainContent**

Main content area container that renders page components.

```tsx
interface MainContentProps {
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
}

const MainContent: React.FC<MainContentProps>
```

**Props:**
- `children`: Page content to render
- `className` (optional): Additional CSS classes
- `loading` (optional): Show loading state

**Architecture Compliance:**
- ✅ SRP: Only handles content area rendering
- ✅ Size Limit: Maximum 60 lines
- ✅ OCP: Extensible through children prop

---

### **StatusBar**

Bottom status bar showing system information. Single responsibility: status display only.

```tsx
interface StatusBarProps {
  connectionStatus: ConnectionStatus;
  deviceCount: number;
  version: string;
  lastUpdate?: Date;
}

const StatusBar: React.FC<StatusBarProps>
```

**Props:**
- `connectionStatus`: Backend connection state
- `deviceCount`: Number of connected devices
- `version`: Application version
- `lastUpdate` (optional): Last data update timestamp

**Architecture Compliance:**
- ✅ SRP: Only handles status information display
- ✅ Size Limit: Maximum 70 lines
- ✅ ISP: Specific interface for status concerns only

---

## 🎨 UI Components

### **Button**

Versatile button component with SOLID principles compliance.

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps>
```

**Props:**
- `variant` (optional): Visual variant (default: 'primary')
- `size` (optional): Size variant (default: 'md')
- `loading` (optional): Show loading spinner
- `icon` (optional): Icon element
- `children`: Button content
- Extends all standard HTML button attributes

**Usage:**
```tsx
<Button 
  variant="primary" 
  size="lg" 
  loading={submitting}
  onClick={handleSubmit}
>
  Save Changes
</Button>
```

**Architecture Compliance:**
- ✅ SRP: Only handles button rendering and styling
- ✅ Size Limit: Maximum 50 lines
- ✅ OCP: Extensible through variant system
- ✅ LSP: All variants interchangeable

---

### **Card**

Flexible card container with compound component pattern.

```tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

const Card: React.FC<CardProps> & {
  Header: React.FC<CardSectionProps>;
  Body: React.FC<CardSectionProps>;
  Footer: React.FC<CardSectionProps>;
}
```

**Compound Components:**
```tsx
interface CardSectionProps {
  children: React.ReactNode;
  className?: string;
}

Card.Header: React.FC<CardSectionProps>
Card.Body: React.FC<CardSectionProps>
Card.Footer: React.FC<CardSectionProps>
```

**Usage:**
```tsx
<Card>
  <Card.Header>
    <h2>Device Status</h2>
  </Card.Header>
  <Card.Body>
    <p>Device content here</p>
  </Card.Body>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

**Architecture Compliance:**
- ✅ SRP: Each component handles single UI concern
- ✅ Size Limit: Each component under 40 lines
- ✅ OCP: Extensible composition through compound pattern

---

### **Input**

Form input component with validation support.

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  loading?: boolean;
}

const Input: React.FC<InputProps>
```

**Props:**
- `label` (optional): Input label text
- `error` (optional): Error message to display
- `helperText` (optional): Help text
- `required` (optional): Required field indicator
- `loading` (optional): Loading state
- Extends all standard HTML input attributes

**Usage:**
```tsx
<Input
  label="Device Name"
  error={errors.name}
  required
  value={deviceName}
  onChange={(e) => setDeviceName(e.target.value)}
/>
```

**Architecture Compliance:**
- ✅ SRP: Only handles input field rendering and validation display
- ✅ Size Limit: Maximum 60 lines
- ✅ ISP: Specific interface for input concerns

---

### **Modal**

Modal dialog component with accessibility features.

```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
}

const Modal: React.FC<ModalProps>
```

**Props:**
- `isOpen`: Modal visibility state
- `onClose`: Close callback function
- `title` (optional): Modal title
- `children`: Modal content
- `size` (optional): Size variant (default: 'md')
- `closeOnEscape` (optional): Close on Escape key (default: true)
- `closeOnOverlayClick` (optional): Close on overlay click (default: true)

**Usage:**
```tsx
<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Confirm Delete"
  size="sm"
>
  <p>Are you sure you want to delete this device?</p>
  <div className="flex space-x-2">
    <Button variant="danger" onClick={handleDelete}>Delete</Button>
    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
  </div>
</Modal>
```

**Architecture Compliance:**
- ✅ SRP: Only handles modal dialog rendering and interactions
- ✅ Size Limit: Maximum 80 lines
- ✅ OCP: Extensible through size variants and props

---

## 🎯 Feature Components

### **ConnectionStatus**

Real-time backend connection status display. Single responsibility: connection status only.

```tsx
interface ConnectionStatusProps {
  status: ConnectionStatus;
  lastConnected?: Date;
  onReconnect?: () => void;
  showDetails?: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps>
```

**Props:**
- `status`: Current connection status
- `lastConnected` (optional): Last successful connection
- `onReconnect` (optional): Manual reconnect callback
- `showDetails` (optional): Show detailed connection info

**Architecture Compliance:**
- ✅ SRP: Only handles connection status display
- ✅ Size Limit: Maximum 70 lines
- ✅ Observer Pattern: Reacts to connection state changes

---

### **DeviceCard**

Individual device display card. Single responsibility: device information display.

```tsx
interface DeviceCardProps {
  device: Device;
  onEdit?: (device: Device) => void;
  onDelete?: (deviceId: string) => void;
  onTest?: (deviceId: string) => void;
  compact?: boolean;
}

const DeviceCard: React.FC<DeviceCardProps>
```

**Props:**
- `device`: Device data object
- `onEdit` (optional): Edit device callback
- `onDelete` (optional): Delete device callback
- `onTest` (optional): Test device callback
- `compact` (optional): Compact display mode

**Architecture Compliance:**
- ✅ SRP: Only handles single device display
- ✅ Size Limit: Maximum 90 lines
- ✅ LSP: Substitutable with other card components

---

### **DeviceForm**

Device creation and editing form. Single responsibility: device form handling.

```tsx
interface DeviceFormProps {
  initialValues?: Partial<Device>;
  onSubmit: (data: DeviceFormData) => Promise<void>;
  onCancel?: () => void;
  mode: 'create' | 'edit';
  loading?: boolean;
}

const DeviceForm: React.FC<DeviceFormProps>
```

**Props:**
- `initialValues` (optional): Pre-filled form values
- `onSubmit`: Form submission callback
- `onCancel` (optional): Cancel callback
- `mode`: Form mode (create or edit)
- `loading` (optional): Submission loading state

**Architecture Compliance:**
- ✅ SRP: Only handles device form logic
- ✅ Size Limit: Maximum 120 lines
- ✅ Strategy Pattern: Different behavior for create/edit modes

---

## 🪝 Custom Hooks

### **useDevices**

Device data management hook with Repository pattern.

```tsx
interface UseDevicesReturn {
  devices: Device[];
  loading: boolean;
  error: string | null;
  addDevice: (data: CreateDeviceData) => Promise<Device>;
  updateDevice: (id: string, data: Partial<Device>) => Promise<Device>;
  deleteDevice: (id: string) => Promise<void>;
  refetch: () => void;
}

const useDevices: () => UseDevicesReturn
```

**Returns:**
- `devices`: Array of device objects
- `loading`: Loading state
- `error`: Error message if any
- `addDevice`: Create new device function
- `updateDevice`: Update existing device function
- `deleteDevice`: Delete device function
- `refetch`: Manual data refetch function

**Usage:**
```tsx
const { 
  devices, 
  loading, 
  error, 
  addDevice, 
  updateDevice, 
  deleteDevice 
} = useDevices();
```

**Architecture Compliance:**
- ✅ SRP: Only handles device data management
- ✅ Size Limit: Maximum 100 lines
- ✅ Repository Pattern: Abstracts data access
- ✅ Command Pattern: Device operations as commands

---

### **useWebSocket**

WebSocket connection management with Observer pattern.

```tsx
interface UseWebSocketOptions {
  url: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

interface UseWebSocketReturn {
  connectionStatus: ConnectionStatus;
  send: (message: WebSocketMessage) => void;
  subscribe: (event: string, handler: (data: any) => void) => () => void;
  disconnect: () => void;
  reconnect: () => void;
}

const useWebSocket: (options: UseWebSocketOptions) => UseWebSocketReturn
```

**Options:**
- `url`: WebSocket server URL
- `reconnectAttempts` (optional): Max reconnection attempts
- `reconnectInterval` (optional): Reconnection interval in ms
- `onConnect` (optional): Connection callback
- `onDisconnect` (optional): Disconnection callback
- `onError` (optional): Error callback

**Returns:**
- `connectionStatus`: Current connection status
- `send`: Send message function
- `subscribe`: Event subscription function
- `disconnect`: Manual disconnect function
- `reconnect`: Manual reconnect function

**Architecture Compliance:**
- ✅ SRP: Only handles WebSocket connection management
- ✅ Size Limit: Maximum 120 lines
- ✅ Observer Pattern: Event subscription system
- ✅ Strategy Pattern: Different reconnection strategies

---

### **useForm**

Generic form state management hook.

```tsx
interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => Promise<void> | void;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  setValue: (field: keyof T, value: any) => void;
  setFieldTouched: (field: keyof T) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
}

const useForm: <T>(options: UseFormOptions<T>) => UseFormReturn<T>
```

**Generic Parameters:**
- `T`: Form data type

**Architecture Compliance:**
- ✅ SRP: Only handles form state and validation
- ✅ Size Limit: Maximum 100 lines
- ✅ Generic: Reusable across all form types
- ✅ Strategy Pattern: Pluggable validation strategies

---

## 🔧 Services

### **DeviceService**

Device API operations with Repository pattern implementation.

```tsx
interface DeviceRepository {
  getDevices(filters?: DeviceFilters): Promise<Device[]>;
  getDevice(id: string): Promise<Device>;
  createDevice(data: CreateDeviceData): Promise<Device>;
  updateDevice(id: string, data: Partial<Device>): Promise<Device>;
  deleteDevice(id: string): Promise<void>;
  testDevice(id: string): Promise<TestResult>;
}

class DeviceService implements DeviceRepository {
  // Implementation details
}

const deviceService: DeviceRepository
```

**Methods:**
- `getDevices`: Fetch devices with optional filtering
- `getDevice`: Fetch single device by ID
- `createDevice`: Create new device
- `updateDevice`: Update existing device
- `deleteDevice`: Remove device
- `testDevice`: Test device connectivity

**Architecture Compliance:**
- ✅ SRP: Only handles device API operations
- ✅ Size Limit: Maximum 150 lines
- ✅ Repository Pattern: Abstracts data access
- ✅ DIP: Depends on interfaces, not implementations

---

### **WebSocketService**

WebSocket connection management service with Singleton pattern.

```tsx
interface WebSocketManager {
  connect(url: string): Promise<void>;
  disconnect(): void;
  send(message: WebSocketMessage): void;
  subscribe(event: string, handler: (data: any) => void): () => void;
  getConnectionStatus(): ConnectionStatus;
}

class WebSocketService implements WebSocketManager {
  private static instance: WebSocketService;
  static getInstance(): WebSocketService;
  // Implementation details
}

const webSocketService: WebSocketManager
```

**Methods:**
- `connect`: Establish WebSocket connection
- `disconnect`: Close WebSocket connection
- `send`: Send message to server
- `subscribe`: Subscribe to events
- `getConnectionStatus`: Get current connection status

**Architecture Compliance:**
- ✅ SRP: Only handles WebSocket operations
- ✅ Size Limit: Maximum 120 lines
- ✅ Singleton Pattern: Single instance management
- ✅ Observer Pattern: Event subscription system

---

## 📊 TypeScript Interfaces (Interface Segregation Principle)

### **Device Types**

```tsx
interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  lastSeen: Date;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
}

type DeviceType = 'ios' | 'android' | 'web';
type DeviceStatus = 'online' | 'offline' | 'connecting';

interface CreateDeviceData {
  name: string;
  type: DeviceType;
  ipAddress?: string;
  userAgent?: string;
}

interface DeviceFilters {
  status?: DeviceStatus;
  type?: DeviceType;
  search?: string;
}
```

### **API Response Types**

```tsx
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
```

### **Form Types**

```tsx
interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
```

**Architecture Compliance:**
- ✅ ISP: Segregated interfaces for specific concerns
- ✅ Single Responsibility: Each interface has one purpose
- ✅ Generic Types: Reusable across components

---

## 🏪 Stores (State Management)

### **useDeviceStore**

Zustand store for device state management.

```tsx
interface DeviceState {
  devices: Device[];
  selectedDevice: Device | null;
  loading: boolean;
  error: string | null;
}

interface DeviceActions {
  setDevices: (devices: Device[]) => void;
  addDevice: (device: Device) => void;
  updateDevice: (id: string, updates: Partial<Device>) => void;
  deleteDevice: (id: string) => void;
  selectDevice: (device: Device | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type DeviceStore = DeviceState & DeviceActions;

const useDeviceStore: () => DeviceStore
```

**Architecture Compliance:**
- ✅ SRP: Only handles device state
- ✅ Size Limit: Maximum 100 lines
- ✅ Immutable Updates: State changes through actions only

---

## 🛠️ Utilities

### **Formatters**

```tsx
const formatters = {
  date: (date: Date, format?: string) => string;
  deviceStatus: (status: DeviceStatus) => string;
  ipAddress: (ip: string) => string;
  fileSize: (bytes: number) => string;
  duration: (ms: number) => string;
};
```

### **Validators**

```tsx
const validators = {
  deviceName: (name: string) => ValidationResult;
  ipAddress: (ip: string) => ValidationResult;
  required: (value: any) => ValidationResult;
  email: (email: string) => ValidationResult;
  url: (url: string) => ValidationResult;
};
```

### **Constants**

```tsx
const ROUTES = {
  DASHBOARD: '/',
  DEVICES: '/devices',
  SETTINGS: '/settings',
  HISTORY: '/history',
  TEST: '/test',
} as const;

const DEVICE_TYPES = {
  IOS: 'ios',
  ANDROID: 'android',
  WEB: 'web',
} as const;

const CONNECTION_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
} as const;
```

**Architecture Compliance:**
- ✅ SRP: Each utility has single purpose
- ✅ Size Limit: Each utility under 50 lines
- ✅ DRY: Reusable across application
- ✅ Pure Functions: No side effects

---

## 📚 Usage Examples

### **Complete Component Example**

```tsx
// Device list page with proper architecture
const DeviceListPage: React.FC = () => {
  const { devices, loading, error, deleteDevice } = useDevices();
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  
  const handleDelete = async (deviceId: string) => {
    try {
      await deleteDevice(deviceId);
    } catch (error) {
      console.error('Failed to delete device:', error);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Devices</h1>
        <Button variant="primary" onClick={() => navigate('/devices/create')}>
          Add Device
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map(device => (
          <DeviceCard
            key={device.id}
            device={device}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};
```

### **Custom Hook Example**

```tsx
// Custom hook with Repository pattern
const useDeviceActions = (deviceId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const testDevice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await deviceService.testDevice(deviceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  return { testDevice, loading, error };
};
```

This API reference ensures all components and hooks follow SOLID principles, maintain size limits, and provide clear separation of concerns throughout the BeepMyPhone frontend architecture.