# BeepMyPhone Frontend Code Examples

This document provides comprehensive, production-ready code examples demonstrating SOLID principles implementation, React best practices, and architectural patterns used throughout the BeepMyPhone frontend application.

## 📋 Table of Contents

1. [SOLID Principles Implementation](#solid-principles-implementation)
2. [Component Architecture Examples](#component-architecture-examples)
3. [Custom Hooks Examples](#custom-hooks-examples)
4. [Service Layer Examples](#service-layer-examples)
5. [State Management Examples](#state-management-examples)
6. [Testing Examples](#testing-examples)
7. [Performance Optimization Examples](#performance-optimization-examples)

---

## 🏗️ SOLID Principles Implementation

### **Single Responsibility Principle (SRP)**

#### **✅ Correct Implementation**

```tsx
// ✅ GOOD: DeviceStatus - Single responsibility (status display only)
interface DeviceStatusProps {
  status: DeviceStatus;
  lastSeen?: Date;
}

const DeviceStatus: React.FC<DeviceStatusProps> = ({ status, lastSeen }) => {
  const getStatusColor = (status: DeviceStatus): string => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 border-green-200';
      case 'offline': return 'bg-red-100 text-red-800 border-red-200';
      case 'connecting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatLastSeen = (date?: Date): string => {
    if (!date) return '';
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="flex items-center space-x-2">
      <span className={`
        px-2 py-1 rounded-full text-xs font-medium border
        ${getStatusColor(status)}
      `}>
        {status}
      </span>
      {lastSeen && (
        <span className="text-xs text-gray-500">
          {formatLastSeen(lastSeen)}
        </span>
      )}
    </div>
  );
};

// ✅ GOOD: DeviceActions - Single responsibility (actions only)
interface DeviceActionsProps {
  device: Device;
  onEdit: (device: Device) => void;
  onDelete: (deviceId: string) => void;
  onTest: (deviceId: string) => void;
  disabled?: boolean;
}

const DeviceActions: React.FC<DeviceActionsProps> = ({
  device,
  onEdit,
  onDelete,
  onTest,
  disabled = false
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onEdit(device)}
        disabled={disabled}
        aria-label={`Edit ${device.name}`}
      >
        <EditIcon className="h-4 w-4" />
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onTest(device.id)}
        disabled={disabled}
        aria-label={`Test ${device.name}`}
      >
        <TestTubeIcon className="h-4 w-4" />
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onDelete(device.id)}
        disabled={disabled}
        aria-label={`Delete ${device.name}`}
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};
```

#### **❌ Incorrect Implementation**

```tsx
// ❌ BAD: Multiple responsibilities in one component
const DeviceCardBad: React.FC<{ deviceId: string }> = ({ deviceId }) => {
  const [device, setDevice] = useState<Device | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // BAD: API responsibility
  useEffect(() => {
    deviceService.getDevice(deviceId).then(setDevice);
  }, [deviceId]);

  // BAD: Delete logic responsibility
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deviceService.deleteDevice(deviceId);
      // More complex logic...
    } finally {
      setDeleting(false);
    }
  };

  // BAD: Form logic responsibility
  const handleEdit = (formData: DeviceFormData) => {
    // Complex form handling...
  };

  // BAD: Multiple UI concerns in one component
  return (
    <div>
      {/* Status display */}
      {/* Device details */}
      {/* Action buttons */}
      {/* Edit form */}
      {/* Delete confirmation */}
    </div>
  );
};
```

---

### **Open/Closed Principle (OCP)**

#### **✅ Correct Implementation**

```tsx
// ✅ GOOD: Button component extensible through variants (Open for extension)
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ComponentType<{ className?: string }>;
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <button className={classes} disabled={disabled} {...props}>
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
};

// ✅ GOOD: Easy extension with new variants (no modification needed)
// New variants can be added to the type and variantClasses object
```

---

### **Liskov Substitution Principle (LSP)**

#### **✅ Correct Implementation**

```tsx
// ✅ GOOD: All status badge variants are substitutable
interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'dot' | 'pill';
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  variant = 'default',
  size = 'md' 
}) => {
  // All variants follow the same interface contract
  const baseClasses = 'inline-flex items-center font-medium';
  
  switch (variant) {
    case 'dot':
      return (
        <span className={`${baseClasses} space-x-1.5`}>
          <div className="w-2 h-2 bg-current rounded-full opacity-75" />
          <span>{status}</span>
        </span>
      );
      
    case 'pill':
      return (
        <span className={`${baseClasses} px-2.5 py-0.5 rounded-full text-xs bg-gray-100`}>
          {status}
        </span>
      );
      
    default:
      return (
        <span className={`${baseClasses} px-2 py-1 rounded text-sm bg-gray-100`}>
          {status}
        </span>
      );
  }
};

// ✅ GOOD: All variants can be used interchangeably
const ExampleUsage: React.FC = () => {
  return (
    <div className="space-y-2">
      <StatusBadge status="Online" variant="default" />
      <StatusBadge status="Online" variant="dot" />
      <StatusBadge status="Online" variant="pill" />
    </div>
  );
};
```

---

### **Interface Segregation Principle (ISP)**

#### **✅ Correct Implementation**

```tsx
// ✅ GOOD: Segregated interfaces for specific concerns
interface DeviceDisplayData {
  id: string;
  name: string;
  status: DeviceStatus;
  lastSeen: Date;
}

interface DeviceActions {
  onEdit: (device: Device) => void;
  onDelete: (deviceId: string) => void;
  onTest: (deviceId: string) => void;
}

interface DeviceStats {
  totalNotifications: number;
  successRate: number;
  avgResponseTime: number;
}

// Components only depend on interfaces they need
const DeviceInfo: React.FC<{ device: DeviceDisplayData }> = ({ device }) => {
  return (
    <div>
      <h3>{device.name}</h3>
      <DeviceStatus status={device.status} lastSeen={device.lastSeen} />
    </div>
  );
};

const DeviceActionPanel: React.FC<{ device: DeviceDisplayData } & DeviceActions> = ({
  device,
  onEdit,
  onDelete,
  onTest
}) => {
  return (
    <DeviceActions
      device={device}
      onEdit={onEdit}
      onDelete={onDelete}
      onTest={onTest}
    />
  );
};

const DeviceMetrics: React.FC<{ stats: DeviceStats }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <span className="text-sm text-gray-500">Notifications</span>
        <span className="block text-lg font-semibold">{stats.totalNotifications}</span>
      </div>
      <div>
        <span className="text-sm text-gray-500">Success Rate</span>
        <span className="block text-lg font-semibold">{stats.successRate}%</span>
      </div>
      <div>
        <span className="text-sm text-gray-500">Avg Response</span>
        <span className="block text-lg font-semibold">{stats.avgResponseTime}ms</span>
      </div>
    </div>
  );
};
```

---

### **Dependency Inversion Principle (DIP)**

#### **✅ Correct Implementation**

```tsx
// ✅ GOOD: High-level component depends on abstraction
interface NotificationRepository {
  getNotifications(filters?: NotificationFilters): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
  deleteNotification(id: string): Promise<void>;
}

// ✅ GOOD: Custom hook abstracts repository implementation
const useNotifications = (repository: NotificationRepository) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (filters?: NotificationFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await repository.getNotifications(filters);
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await repository.markAsRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  }, [repository]);

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
  };
};

// ✅ GOOD: Component depends on abstraction through dependency injection
const NotificationList: React.FC<{ repository: NotificationRepository }> = ({ repository }) => {
  const { notifications, loading, error, markAsRead } = useNotifications(repository);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-2">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={() => markAsRead(notification.id)}
        />
      ))}
    </div>
  );
};

// ✅ GOOD: Repository implementation (low-level detail)
class ApiNotificationRepository implements NotificationRepository {
  constructor(private apiClient: ApiClient) {}

  async getNotifications(filters?: NotificationFilters): Promise<Notification[]> {
    const response = await this.apiClient.get('/api/notifications', { params: filters });
    return response.data;
  }

  async markAsRead(id: string): Promise<void> {
    await this.apiClient.patch(`/api/notifications/${id}`, { isRead: true });
  }

  async deleteNotification(id: string): Promise<void> {
    await this.apiClient.delete(`/api/notifications/${id}`);
  }
}

// ✅ GOOD: Dependency injection in app setup
const App: React.FC = () => {
  const notificationRepository = new ApiNotificationRepository(apiClient);

  return (
    <div>
      <NotificationList repository={notificationRepository} />
    </div>
  );
};
```

---

## 🎯 Component Architecture Examples

### **Compound Component Pattern**

```tsx
// ✅ GOOD: Flexible composition with compound components
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> & {
  Header: React.FC<CardSectionProps>;
  Body: React.FC<CardSectionProps>;
  Footer: React.FC<CardSectionProps>;
} = ({ children, className }) => {
  return (
    <div className={cn('bg-white rounded-lg shadow-sm border', className)}>
      {children}
    </div>
  );
};

interface CardSectionProps {
  children: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardSectionProps> = ({ children, className }) => (
  <div className={cn('px-6 py-4 border-b border-gray-200', className)}>
    {children}
  </div>
);

const CardBody: React.FC<CardSectionProps> = ({ children, className }) => (
  <div className={cn('px-6 py-4', className)}>
    {children}
  </div>
);

const CardFooter: React.FC<CardSectionProps> = ({ children, className }) => (
  <div className={cn('px-6 py-4 border-t border-gray-200', className)}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

// Usage: Flexible composition
const DeviceCard: React.FC<{ device: Device }> = ({ device }) => (
  <Card>
    <Card.Header>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{device.name}</h3>
        <DeviceStatus status={device.status} />
      </div>
    </Card.Header>
    
    <Card.Body>
      <div className="space-y-2">
        <p className="text-sm text-gray-600">Type: {device.type}</p>
        <p className="text-sm text-gray-600">IP: {device.ipAddress}</p>
      </div>
    </Card.Body>
    
    <Card.Footer>
      <div className="flex justify-end space-x-2">
        <Button size="sm" variant="ghost">Edit</Button>
        <Button size="sm" variant="ghost">Test</Button>
      </div>
    </Card.Footer>
  </Card>
);
```

### **Render Props Pattern**

```tsx
// ✅ GOOD: Flexible data fetching with render props
interface DataFetcherProps<T> {
  url: string;
  children: (state: {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
  }) => React.ReactNode;
}

const DataFetcher = <T,>({ url, children }: DataFetcherProps<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);
      if (!response.ok) throw new Error(response.statusText);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return <>{children({ data, loading, error, refetch: fetchData })}</>;
};

// Usage: Flexible rendering
const DeviceListWithRenderProps: React.FC = () => (
  <DataFetcher<Device[]> url="/api/devices">
    {({ data: devices, loading, error, refetch }) => {
      if (loading) return <LoadingSpinner />;
      if (error) return (
        <div>
          <ErrorMessage message={error} />
          <Button onClick={refetch}>Retry</Button>
        </div>
      );
      
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices?.map(device => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      );
    }}
  </DataFetcher>
);
```

### **Higher-Order Component Pattern**

```tsx
// ✅ GOOD: HOC for loading states
const withLoading = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const WithLoadingComponent = (props: P & { loading?: boolean }) => {
    const { loading, ...rest } = props;
    
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner />
        </div>
      );
    }
    
    return <WrappedComponent {...(rest as P)} />;
  };

  WithLoadingComponent.displayName = 
    `withLoading(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithLoadingComponent;
};

// ✅ GOOD: HOC for error boundaries
const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = 
    `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
};

// Usage: Composable enhancements
const EnhancedDeviceList = withErrorBoundary(withLoading(DeviceList));
```

---

## 🪝 Custom Hooks Examples

### **Data Fetching Hook with Repository Pattern**

```tsx
// ✅ GOOD: Generic data fetching hook
interface UseRepositoryOptions<T> {
  repository: Repository<T>;
  initialLoad?: boolean;
  dependencies?: React.DependencyList;
}

interface UseRepositoryReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  create: (item: Omit<T, 'id'>) => Promise<T>;
  update: (id: string, updates: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const useRepository = <T extends { id: string }>({
  repository,
  initialLoad = true,
  dependencies = []
}: UseRepositoryOptions<T>): UseRepositoryReturn<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(initialLoad);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await repository.getAll();
      setData(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const create = useCallback(async (item: Omit<T, 'id'>): Promise<T> => {
    try {
      setError(null);
      const newItem = await repository.create(item);
      setData(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [repository]);

  const update = useCallback(async (id: string, updates: Partial<T>): Promise<T> => {
    try {
      setError(null);
      const updatedItem = await repository.update(id, updates);
      setData(prev => 
        prev.map(item => 
          item.id === id ? updatedItem : item
        )
      );
      return updatedItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [repository]);

  const remove = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await repository.delete(id);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [repository]);

  useEffect(() => {
    if (initialLoad) {
      fetchData();
    }
  }, [fetchData, ...dependencies]);

  return {
    data,
    loading,
    error,
    create,
    update,
    remove,
    refetch: fetchData,
  };
};

// Usage: Specific implementation
const useDevices = () => {
  return useRepository<Device>({
    repository: deviceRepository,
    initialLoad: true,
  });
};
```

### **Form Management Hook**

```tsx
// ✅ GOOD: Generic form hook with validation
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
  setValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldTouched: (field: keyof T) => void;
  setFieldError: (field: keyof T, error: string) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
}

const useForm = <T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit
}: UseFormOptions<T>): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!validate) return true;
    
    const validationErrors = validate(values);
    setErrors(validationErrors);
    
    return Object.keys(validationErrors).length === 0;
  }, [values, validate]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const isValid = validateForm();
    
    if (!isValid) {
      // Mark all fields as touched to show errors
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Partial<Record<keyof T, boolean>>
      );
      setTouched(allTouched);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setFieldTouched,
    setFieldError,
    handleSubmit,
    reset,
  };
};

// Usage: Device form
interface DeviceFormData {
  name: string;
  type: DeviceType;
  ipAddress: string;
}

const DeviceForm: React.FC<{
  initialValues?: Partial<DeviceFormData>;
  onSubmit: (data: DeviceFormData) => Promise<void>;
}> = ({ initialValues, onSubmit }) => {
  const {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    handleSubmit
  } = useForm<DeviceFormData>({
    initialValues: {
      name: '',
      type: 'ios',
      ipAddress: '',
      ...initialValues,
    },
    validate: (values) => {
      const errors: Partial<Record<keyof DeviceFormData, string>> = {};
      
      if (!values.name.trim()) {
        errors.name = 'Device name is required';
      }
      
      if (!values.ipAddress.trim()) {
        errors.ipAddress = 'IP address is required';
      } else if (!isValidIP(values.ipAddress)) {
        errors.ipAddress = 'Invalid IP address format';
      }
      
      return errors;
    },
    onSubmit,
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Device Name"
        value={values.name}
        onChange={(e) => setValue('name', e.target.value)}
        onBlur={() => setFieldTouched('name')}
        error={touched.name ? errors.name : undefined}
        required
      />
      
      <Input
        label="IP Address"
        value={values.ipAddress}
        onChange={(e) => setValue('ipAddress', e.target.value)}
        onBlur={() => setFieldTouched('ipAddress')}
        error={touched.ipAddress ? errors.ipAddress : undefined}
        placeholder="192.168.1.100"
        required
      />
      
      <Button type="submit" loading={isSubmitting}>
        Save Device
      </Button>
    </form>
  );
};
```

### **WebSocket Hook with Observer Pattern**

```tsx
// ✅ GOOD: WebSocket hook with event subscription
interface UseWebSocketOptions {
  url: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

interface UseWebSocketReturn {
  connectionStatus: ConnectionStatus;
  lastMessage: MessageEvent | null;
  send: (message: string | object) => void;
  subscribe: (event: string, handler: (data: any) => void) => () => void;
  connect: () => void;
  disconnect: () => void;
}

const useWebSocket = (options: UseWebSocketOptions): UseWebSocketReturn => {
  const {
    url,
    onConnect,
    onDisconnect,
    onError,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
  } = options;

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  
  const websocket = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const eventHandlers = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  const connect = useCallback(() => {
    if (websocket.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus('connecting');
    websocket.current = new WebSocket(url);

    websocket.current.onopen = () => {
      setConnectionStatus('connected');
      reconnectCount.current = 0;
      onConnect?.();
    };

    websocket.current.onclose = () => {
      setConnectionStatus('disconnected');
      onDisconnect?.();
      
      // Auto-reconnect logic
      if (reconnectCount.current < reconnectAttempts) {
        setTimeout(() => {
          reconnectCount.current++;
          connect();
        }, reconnectInterval);
      }
    };

    websocket.current.onerror = (error) => {
      setConnectionStatus('error');
      onError?.(error);
    };

    websocket.current.onmessage = (event) => {
      setLastMessage(event);
      
      try {
        const message = JSON.parse(event.data);
        const handlers = eventHandlers.current.get(message.type);
        
        if (handlers) {
          handlers.forEach(handler => handler(message.data));
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };
  }, [url, onConnect, onDisconnect, onError, reconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (websocket.current) {
      websocket.current.close();
      websocket.current = null;
    }
  }, []);

  const send = useCallback((message: string | object) => {
    if (websocket.current?.readyState === WebSocket.OPEN) {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      websocket.current.send(messageStr);
    }
  }, []);

  const subscribe = useCallback((event: string, handler: (data: any) => void) => {
    const handlers = eventHandlers.current.get(event) || new Set();
    handlers.add(handler);
    eventHandlers.current.set(event, handlers);

    // Return unsubscribe function
    return () => {
      const currentHandlers = eventHandlers.current.get(event);
      if (currentHandlers) {
        currentHandlers.delete(handler);
        if (currentHandlers.size === 0) {
          eventHandlers.current.delete(event);
        }
      }
    };
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connectionStatus,
    lastMessage,
    send,
    subscribe,
    connect,
    disconnect,
  };
};

// Usage: Real-time notifications
const NotificationListener: React.FC = () => {
  const { subscribe, connectionStatus } = useWebSocket({
    url: 'ws://localhost:3001',
    onConnect: () => console.log('Connected to notification service'),
  });

  useEffect(() => {
    const unsubscribe = subscribe('notification', (data) => {
      // Handle incoming notification
      console.log('New notification:', data);
    });

    return unsubscribe;
  }, [subscribe]);

  return (
    <div className="p-4">
      <span className={`status-${connectionStatus}`}>
        {connectionStatus}
      </span>
    </div>
  );
};
```

---

## 🔧 Service Layer Examples

### **Repository Pattern Implementation**

```tsx
// ✅ GOOD: Abstract repository interface
interface Repository<T> {
  getAll(filters?: Record<string, any>): Promise<T[]>;
  getById(id: string): Promise<T>;
  create(item: Omit<T, 'id'>): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// ✅ GOOD: Device repository interface
interface DeviceRepository extends Repository<Device> {
  getByStatus(status: DeviceStatus): Promise<Device[]>;
  testConnection(id: string): Promise<TestResult>;
  updateStatus(id: string, status: DeviceStatus): Promise<void>;
}

// ✅ GOOD: API implementation
class ApiDeviceRepository implements DeviceRepository {
  constructor(private apiClient: ApiClient) {}

  async getAll(filters?: DeviceFilters): Promise<Device[]> {
    const response = await this.apiClient.get('/api/devices', { params: filters });
    return response.data;
  }

  async getById(id: string): Promise<Device> {
    const response = await this.apiClient.get(`/api/devices/${id}`);
    return response.data;
  }

  async create(deviceData: Omit<Device, 'id'>): Promise<Device> {
    const response = await this.apiClient.post('/api/devices', deviceData);
    return response.data;
  }

  async update(id: string, updates: Partial<Device>): Promise<Device> {
    const response = await this.apiClient.patch(`/api/devices/${id}`, updates);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.apiClient.delete(`/api/devices/${id}`);
  }

  async getByStatus(status: DeviceStatus): Promise<Device[]> {
    return this.getAll({ status });
  }

  async testConnection(id: string): Promise<TestResult> {
    const response = await this.apiClient.post(`/api/devices/${id}/test`);
    return response.data;
  }

  async updateStatus(id: string, status: DeviceStatus): Promise<void> {
    await this.update(id, { status });
  }
}

// ✅ GOOD: Mock implementation for testing
class MockDeviceRepository implements DeviceRepository {
  private devices: Device[] = [];
  private nextId = 1;

  async getAll(filters?: DeviceFilters): Promise<Device[]> {
    let result = [...this.devices];
    
    if (filters?.status) {
      result = result.filter(device => device.status === filters.status);
    }
    
    if (filters?.search) {
      result = result.filter(device => 
        device.name.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    
    return result;
  }

  async getById(id: string): Promise<Device> {
    const device = this.devices.find(d => d.id === id);
    if (!device) throw new Error('Device not found');
    return device;
  }

  async create(deviceData: Omit<Device, 'id'>): Promise<Device> {
    const device: Device = {
      ...deviceData,
      id: String(this.nextId++),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.devices.push(device);
    return device;
  }

  async update(id: string, updates: Partial<Device>): Promise<Device> {
    const index = this.devices.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Device not found');
    
    this.devices[index] = {
      ...this.devices[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    return this.devices[index];
  }

  async delete(id: string): Promise<void> {
    const index = this.devices.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Device not found');
    
    this.devices.splice(index, 1);
  }

  async getByStatus(status: DeviceStatus): Promise<Device[]> {
    return this.getAll({ status });
  }

  async testConnection(id: string): Promise<TestResult> {
    const device = await this.getById(id);
    return {
      success: device.status === 'online',
      responseTime: Math.random() * 100,
      timestamp: new Date(),
    };
  }

  async updateStatus(id: string, status: DeviceStatus): Promise<void> {
    await this.update(id, { status });
  }
}
```

---

## 🧪 Testing Examples

### **Component Testing with React Testing Library**

```tsx
// ✅ GOOD: Comprehensive component testing
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeviceCard } from '../DeviceCard';
import { mockDevice } from '../../__mocks__/device';

describe('DeviceCard', () => {
  const defaultProps = {
    device: mockDevice,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onTest: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders device information correctly', () => {
    render(<DeviceCard {...defaultProps} />);
    
    expect(screen.getByText(mockDevice.name)).toBeInTheDocument();
    expect(screen.getByText(mockDevice.status)).toBeInTheDocument();
    expect(screen.getByText(`Type: ${mockDevice.type}`)).toBeInTheDocument();
    expect(screen.getByText(`IP: ${mockDevice.ipAddress}`)).toBeInTheDocument();
  });

  it('applies correct status styling', () => {
    const onlineDevice = { ...mockDevice, status: 'online' as const };
    render(<DeviceCard {...defaultProps} device={onlineDevice} />);
    
    const statusBadge = screen.getByText('online');
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<DeviceCard {...defaultProps} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);
    
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockDevice);
  });

  it('shows confirmation dialog before deletion', async () => {
    const user = userEvent.setup();
    render(<DeviceCard {...defaultProps} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);
    
    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument();
  });

  it('calls onDelete when deletion is confirmed', async () => {
    const user = userEvent.setup();
    render(<DeviceCard {...defaultProps} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);
    
    const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
    await user.click(confirmButton);
    
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockDevice.id);
  });

  it('displays loading state during test operation', async () => {
    const onTest = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );
    
    const user = userEvent.setup();
    render(<DeviceCard {...defaultProps} onTest={onTest} />);
    
    const testButton = screen.getByRole('button', { name: /test/i });
    await user.click(testButton);
    
    expect(screen.getByRole('button', { name: /testing/i })).toBeDisabled();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /test/i })).not.toBeDisabled();
    });
  });

  it('is accessible via keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<DeviceCard {...defaultProps} />);
    
    // Tab through all interactive elements
    await user.tab();
    expect(screen.getByRole('button', { name: /edit/i })).toHaveFocus();
    
    await user.tab();
    expect(screen.getByRole('button', { name: /test/i })).toHaveFocus();
    
    await user.tab();
    expect(screen.getByRole('button', { name: /delete/i })).toHaveFocus();
  });
});
```

### **Hook Testing**

```tsx
// ✅ GOOD: Custom hook testing
import { renderHook, waitFor } from '@testing-library/react';
import { useDevices } from '../useDevices';
import { MockDeviceRepository } from '../../__mocks__/DeviceRepository';

describe('useDevices', () => {
  let mockRepository: MockDeviceRepository;

  beforeEach(() => {
    mockRepository = new MockDeviceRepository();
  });

  it('loads devices on mount', async () => {
    const mockDevices = [
      { id: '1', name: 'Test Device 1', status: 'online' },
      { id: '2', name: 'Test Device 2', status: 'offline' },
    ];
    
    mockRepository.devices = mockDevices;

    const { result } = renderHook(() => useDevices(mockRepository));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.devices).toEqual(mockDevices);
    expect(result.current.error).toBeNull();
  });

  it('handles API errors gracefully', async () => {
    mockRepository.getAll = jest.fn().mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useDevices(mockRepository));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('API Error');
    expect(result.current.devices).toEqual([]);
  });

  it('adds new device optimistically', async () => {
    const { result } = renderHook(() => useDevices(mockRepository));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newDeviceData = { name: 'New Device', type: 'ios' as const };
    
    await act(async () => {
      await result.current.addDevice(newDeviceData);
    });

    expect(result.current.devices).toHaveLength(1);
    expect(result.current.devices[0]).toMatchObject(newDeviceData);
  });
});
```

This comprehensive code examples document demonstrates proper SOLID principles implementation, React best practices, and architectural patterns throughout the BeepMyPhone frontend application, ensuring maintainable, testable, and scalable code.