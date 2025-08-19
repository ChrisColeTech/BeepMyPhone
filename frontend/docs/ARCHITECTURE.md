# BeepMyPhone Frontend Architecture Guide

This document defines the architectural principles, React patterns, component design standards, and code quality requirements for the BeepMyPhone frontend application. All code must adhere to these guidelines to ensure maintainability, performance, and scalability.

## 🏗️ React Architecture Principles

### **Component Design Philosophy**

The BeepMyPhone frontend follows a strict component architecture based on separation of concerns, single responsibility, and composition patterns.

#### **Component Hierarchy Structure**

```
Application Level
├── App.tsx (Application Root)
├── Layout Components (Structure)
├── Page Components (Routes)
├── Feature Components (Business Logic)
├── UI Components (Presentation)
└── Utility Components (Helpers)
```

### **Single Responsibility Principle (SRP) in React**

**Definition**: Each React component should have only one reason to change and handle only one specific responsibility.

#### **✅ Correct Component Design**

```tsx
// ✅ GOOD: Single responsibility - only handles device status display
interface DeviceStatusProps {
  device: Device;
}

const DeviceStatus: React.FC<DeviceStatusProps> = ({ device }) => {
  const getStatusColor = (status: DeviceStatus) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(device.status)}`}>
      {device.status}
    </span>
  );
};

// ✅ GOOD: Single responsibility - only handles device actions
interface DeviceActionsProps {
  device: Device;
  onEdit: (device: Device) => void;
  onDelete: (deviceId: string) => void;
  onTest: (deviceId: string) => void;
}

const DeviceActions: React.FC<DeviceActionsProps> = ({ 
  device, 
  onEdit, 
  onDelete, 
  onTest 
}) => {
  return (
    <div className="flex space-x-2">
      <Button size="sm" onClick={() => onEdit(device)}>
        Edit
      </Button>
      <Button size="sm" variant="secondary" onClick={() => onTest(device.id)}>
        Test
      </Button>
      <Button size="sm" variant="danger" onClick={() => onDelete(device.id)}>
        Delete
      </Button>
    </div>
  );
};
```

#### **❌ Incorrect Component Design**

```tsx
// ❌ BAD: Multiple responsibilities (display, actions, API calls, state management)
const DeviceCard: React.FC<{ deviceId: string }> = ({ deviceId }) => {
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  // BAD: API responsibility
  const fetchDevice = async () => {
    const response = await fetch(`/api/devices/${deviceId}`);
    setDevice(await response.json());
  };

  // BAD: Form handling responsibility  
  const handleEdit = (formData: DeviceFormData) => {
    // Form submission logic
  };

  // BAD: Multiple UI concerns in one component
  return (
    <div>
      {/* Status display logic */}
      {/* Device details logic */}
      {/* Action buttons logic */}
      {/* Edit form logic */}
      {/* Delete confirmation logic */}
    </div>
  );
};
```

#### **Enforcement Rules**
- **Maximum 150 lines per component**
- **Maximum 10 props per component**
- **Components must have a single, clear purpose stated in their name**
- **If a component name contains "And" or "Manager", review for SRP violations**

---

### **DRY Principle in React Components**

**Definition**: Don't Repeat Yourself - avoid code duplication through reusable components, custom hooks, and utility functions.

#### **✅ Correct DRY Implementation**

```tsx
// ✅ GOOD: Reusable Status Badge component
interface StatusBadgeProps {
  status: 'online' | 'offline' | 'connecting' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const statusStyles = {
    online: 'bg-green-100 text-green-800',
    offline: 'bg-red-100 text-red-800', 
    connecting: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm', 
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`
      rounded-full font-medium
      ${statusStyles[status]} 
      ${sizeStyles[size]}
    `}>
      {status}
    </span>
  );
};

// ✅ GOOD: Reusable custom hook for data fetching
const useApiData = <T>(url: string, dependencies: unknown[] = []) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
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
    };

    fetchData();
  }, dependencies);

  return { data, loading, error };
};

// Usage: DRY data fetching across components
const DeviceList = () => {
  const { data: devices, loading, error } = useApiData<Device[]>('/api/devices');
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return (
    <div>
      {devices?.map(device => (
        <div key={device.id}>
          <StatusBadge status={device.status} />
        </div>
      ))}
    </div>
  );
};
```

#### **❌ Incorrect DRY Implementation**

```tsx
// ❌ BAD: Repeated status styling logic
const DeviceCard = ({ device }: { device: Device }) => {
  const getStatusStyle = () => {
    if (device.status === 'online') return 'bg-green-100 text-green-800';
    if (device.status === 'offline') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return <span className={getStatusStyle()}>{device.status}</span>;
};

// ❌ BAD: Same logic repeated in different component
const ServerStatus = ({ server }: { server: Server }) => {
  const getStatusStyle = () => {  // Duplicated logic
    if (server.status === 'online') return 'bg-green-100 text-green-800';
    if (server.status === 'offline') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return <span className={getStatusStyle()}>{server.status}</span>;
};
```

#### **DRY Enforcement Rules**
- **Maximum 3 lines of identical code** - extract into function/component
- **Repeated logic 2+ times** - create reusable hook or utility
- **Similar components** - create generic component with props
- **Repeated styling patterns** - create Tailwind component classes

---

## 🚫 React Anti-Pattern Prevention

### **1. Prop Drilling Prevention**

#### **❌ Prop Drilling Anti-Pattern**
```tsx
// ❌ BAD: Props drilled through multiple levels
const App = () => {
  const [user, setUser] = useState<User>();
  return <Dashboard user={user} setUser={setUser} />;
};

const Dashboard = ({ user, setUser }) => {
  return <Sidebar user={user} setUser={setUser} />;
};

const Sidebar = ({ user, setUser }) => {
  return <UserMenu user={user} setUser={setUser} />;
};
```

#### **✅ Correct Solution: Context + Custom Hook**
```tsx
// ✅ GOOD: Context with custom hook
const UserContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
} | null>(null);

const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Usage: Clean component without prop drilling
const UserMenu = () => {
  const { user, setUser } = useUser();
  return <div>{user?.name}</div>;
};
```

### **2. State Management Anti-Patterns**

#### **❌ State Mutation Anti-Pattern**
```tsx
// ❌ BAD: Direct state mutation
const DeviceList = () => {
  const [devices, setDevices] = useState<Device[]>([]);

  const updateDeviceStatus = (deviceId: string, status: DeviceStatus) => {
    // BAD: Mutating state directly
    const device = devices.find(d => d.id === deviceId);
    if (device) {
      device.status = status; // Direct mutation!
      setDevices(devices); // Won't trigger re-render
    }
  };
};
```

#### **✅ Correct Immutable Updates**
```tsx
// ✅ GOOD: Immutable state updates
const DeviceList = () => {
  const [devices, setDevices] = useState<Device[]>([]);

  const updateDeviceStatus = (deviceId: string, status: DeviceStatus) => {
    setDevices(prevDevices => 
      prevDevices.map(device => 
        device.id === deviceId 
          ? { ...device, status }
          : device
      )
    );
  };
};
```

### **3. Component Size Limits**

#### **Size Limits (Enforced)**
- **Maximum 150 lines per component**
- **Maximum 10 props per interface**
- **Maximum 5 useEffect hooks per component**
- **Maximum 8 useState hooks per component**
- **Maximum 3 levels of JSX nesting**

#### **Complexity Limits**
- **Maximum cyclomatic complexity: 10 per function**
- **Maximum nesting depth: 3 levels**
- **Maximum cognitive complexity: 15 per component**

---

## 🎯 React Design Patterns

### **1. Compound Component Pattern**

```tsx
// ✅ GOOD: Compound component for flexible composition
const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {children}
    </div>
  );
};

const CardHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="px-6 py-4 border-b border-gray-200">
      {children}
    </div>
  );
};

const CardBody = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="px-6 py-4">
      {children}
    </div>
  );
};

const CardFooter = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="px-6 py-4 border-t border-gray-200">
      {children}
    </div>
  );
};

// Attach sub-components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

// Usage: Flexible composition
const DeviceCard = () => (
  <Card>
    <Card.Header>
      <h3>Device Name</h3>
    </Card.Header>
    <Card.Body>
      <p>Device details...</p>
    </Card.Body>
    <Card.Footer>
      <Button>Edit</Button>
    </Card.Footer>
  </Card>
);
```

### **2. Render Props Pattern**

```tsx
// ✅ GOOD: Render props for flexible rendering
interface DataFetcherProps<T> {
  url: string;
  children: (data: {
    data: T | null;
    loading: boolean;
    error: string | null;
  }) => React.ReactNode;
}

const DataFetcher = <T,>({ url, children }: DataFetcherProps<T>) => {
  const { data, loading, error } = useApiData<T>(url);
  
  return <>{children({ data, loading, error })}</>;
};

// Usage: Flexible data rendering
const DeviceList = () => (
  <DataFetcher<Device[]> url="/api/devices">
    {({ data: devices, loading, error }) => {
      if (loading) return <LoadingSpinner />;
      if (error) return <ErrorMessage message={error} />;
      return (
        <div>
          {devices?.map(device => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      );
    }}
  </DataFetcher>
);
```

### **3. Higher-Order Component (HOC) Pattern**

```tsx
// ✅ GOOD: HOC for error boundary functionality
const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const WithErrorBoundaryComponent = (props: P) => {
    return (
      <ErrorBoundary>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };

  WithErrorBoundaryComponent.displayName = 
    `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
};

// Usage: Automatic error handling
const SafeDeviceList = withErrorBoundary(DeviceList);
```

---

## 🪝 Custom Hooks Architecture

### **1. Data Fetching Hooks**

```tsx
// ✅ GOOD: Specialized data fetching hook
const useDevices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await deviceApi.getDevices();
      setDevices(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  }, []);

  const addDevice = useCallback(async (deviceData: CreateDeviceData) => {
    try {
      const newDevice = await deviceApi.createDevice(deviceData);
      setDevices(prev => [...prev, newDevice]);
      return newDevice;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add device');
      throw err;
    }
  }, []);

  const updateDevice = useCallback(async (deviceId: string, updates: Partial<Device>) => {
    try {
      const updatedDevice = await deviceApi.updateDevice(deviceId, updates);
      setDevices(prev => 
        prev.map(device => 
          device.id === deviceId ? updatedDevice : device
        )
      );
      return updatedDevice;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update device');
      throw err;
    }
  }, []);

  const deleteDevice = useCallback(async (deviceId: string) => {
    try {
      await deviceApi.deleteDevice(deviceId);
      setDevices(prev => prev.filter(device => device.id !== deviceId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete device');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return {
    devices,
    loading,
    error,
    addDevice,
    updateDevice,
    deleteDevice,
    refetch: fetchDevices
  };
};
```

### **2. Form Management Hooks**

```tsx
// ✅ GOOD: Reusable form hook with validation
interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => Promise<void> | void;
}

const useForm = <T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit
}: UseFormOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validateForm = useCallback(() => {
    if (!validate) return {};
    
    const validationErrors = validate(values);
    setErrors(validationErrors);
    return validationErrors;
  }, [values, validate]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const validationErrors = validateForm();
    const hasErrors = Object.keys(validationErrors).length > 0;
    
    if (hasErrors) {
      // Mark all fields as touched to show errors
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouched(allTouched);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch (err) {
      // Handle submission error
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

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    handleSubmit,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};
```

---

## 🎨 Tailwind CSS Architecture

### **1. Component Class Patterns**

```css
/* ✅ GOOD: Component-specific classes */
@layer components {
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
  }

  .btn-secondary {
    @apply bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2;
  }

  .card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden;
  }

  .form-input {
    @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500;
  }

  .status-badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }

  .status-online {
    @apply status-badge bg-green-100 text-green-800;
  }

  .status-offline {
    @apply status-badge bg-red-100 text-red-800;
  }
}
```

### **2. Utility Class Organization**

```tsx
// ✅ GOOD: Organized utility classes
const DeviceCard = ({ device }: { device: Device }) => {
  return (
    <div className="
      /* Layout */
      flex flex-col p-6 space-y-4
      /* Appearance */
      bg-white rounded-lg shadow-sm border border-gray-200
      /* Interactive */
      hover:shadow-md transition-shadow duration-200
      /* Responsive */
      sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4
    ">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">
          {device.name}
        </h3>
        <p className="text-sm text-gray-500">
          Last seen: {device.lastSeen}
        </p>
      </div>
      
      <div className="flex items-center space-x-3">
        <span className={`status-${device.status}`}>
          {device.status}
        </span>
        <Button variant="primary" size="sm">
          Edit
        </Button>
      </div>
    </div>
  );
};
```

### **3. Responsive Design Patterns**

```tsx
// ✅ GOOD: Mobile-first responsive design
const Dashboard = () => {
  return (
    <div className="
      /* Mobile: Stack vertically */
      flex flex-col space-y-6 p-4
      /* Tablet: 2 columns */
      md:grid md:grid-cols-2 md:gap-6 md:space-y-0
      /* Desktop: 3 columns */
      lg:grid-cols-3
      /* Large: 4 columns */
      xl:grid-cols-4
    ">
      <StatsCard />
      <StatsCard />
      <StatsCard />
      <StatsCard />
    </div>
  );
};
```

---

## 📊 State Management Architecture

### **1. Zustand Store Pattern**

```tsx
// ✅ GOOD: Domain-specific store with TypeScript
interface DeviceState {
  devices: Device[];
  selectedDevice: Device | null;
  loading: boolean;
  error: string | null;
}

interface DeviceActions {
  setDevices: (devices: Device[]) => void;
  addDevice: (device: Device) => void;
  updateDevice: (deviceId: string, updates: Partial<Device>) => void;
  deleteDevice: (deviceId: string) => void;
  selectDevice: (device: Device | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type DeviceStore = DeviceState & DeviceActions;

const useDeviceStore = create<DeviceStore>((set, get) => ({
  // State
  devices: [],
  selectedDevice: null,
  loading: false,
  error: null,

  // Actions
  setDevices: (devices) => 
    set({ devices, error: null }),

  addDevice: (device) => 
    set((state) => ({ 
      devices: [...state.devices, device],
      error: null 
    })),

  updateDevice: (deviceId, updates) =>
    set((state) => ({
      devices: state.devices.map(device =>
        device.id === deviceId ? { ...device, ...updates } : device
      ),
      selectedDevice: state.selectedDevice?.id === deviceId 
        ? { ...state.selectedDevice, ...updates }
        : state.selectedDevice
    })),

  deleteDevice: (deviceId) =>
    set((state) => ({
      devices: state.devices.filter(device => device.id !== deviceId),
      selectedDevice: state.selectedDevice?.id === deviceId 
        ? null 
        : state.selectedDevice
    })),

  selectDevice: (device) => 
    set({ selectedDevice: device }),

  setLoading: (loading) => 
    set({ loading }),

  setError: (error) => 
    set({ error, loading: false }),
}));
```

### **2. React Query Integration**

```tsx
// ✅ GOOD: React Query for server state
const deviceKeys = {
  all: ['devices'] as const,
  lists: () => [...deviceKeys.all, 'list'] as const,
  list: (filters: DeviceFilters) => [...deviceKeys.lists(), filters] as const,
  details: () => [...deviceKeys.all, 'detail'] as const,
  detail: (id: string) => [...deviceKeys.details(), id] as const,
};

const useDevicesQuery = (filters: DeviceFilters = {}) => {
  return useQuery({
    queryKey: deviceKeys.list(filters),
    queryFn: () => deviceApi.getDevices(filters),
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
};

const useDeviceQuery = (deviceId: string) => {
  return useQuery({
    queryKey: deviceKeys.detail(deviceId),
    queryFn: () => deviceApi.getDevice(deviceId),
    enabled: !!deviceId,
  });
};

const useCreateDeviceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deviceApi.createDevice,
    onSuccess: (newDevice) => {
      // Update the devices list
      queryClient.setQueryData<Device[]>(
        deviceKeys.lists(),
        (oldData) => oldData ? [...oldData, newDevice] : [newDevice]
      );
      
      // Invalidate and refetch device lists
      queryClient.invalidateQueries({
        queryKey: deviceKeys.lists(),
      });
    },
  });
};
```

---

## 🧪 Testing Architecture

### **1. Component Testing Pattern**

```tsx
// ✅ GOOD: Comprehensive component testing
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DeviceCard } from './DeviceCard';
import { mockDevice } from '../__mocks__/device';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('DeviceCard', () => {
  const mockProps = {
    device: mockDevice,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onTest: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders device information correctly', () => {
    renderWithProviders(<DeviceCard {...mockProps} />);
    
    expect(screen.getByText(mockDevice.name)).toBeInTheDocument();
    expect(screen.getByText(mockDevice.status)).toBeInTheDocument();
    expect(screen.getByText(`Last seen: ${mockDevice.lastSeen}`)).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DeviceCard {...mockProps} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);
    
    expect(mockProps.onEdit).toHaveBeenCalledWith(mockDevice);
  });

  it('shows confirmation dialog before deletion', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DeviceCard {...mockProps} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);
    
    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
  });

  it('applies correct status styling', () => {
    const onlineDevice = { ...mockDevice, status: 'online' as const };
    renderWithProviders(<DeviceCard {...mockProps} device={onlineDevice} />);
    
    const statusBadge = screen.getByText('online');
    expect(statusBadge).toHaveClass('status-online');
  });
});
```

### **2. Hook Testing Pattern**

```tsx
// ✅ GOOD: Custom hook testing
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDevices } from './useDevices';
import * as deviceApi from '../api/devices';

jest.mock('../api/devices');
const mockDeviceApi = deviceApi as jest.Mocked<typeof deviceApi>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useDevices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches devices on mount', async () => {
    const mockDevices = [{ id: '1', name: 'Test Device' }];
    mockDeviceApi.getDevices.mockResolvedValue({ data: mockDevices });

    const { result } = renderHook(() => useDevices(), {
      wrapper: createWrapper(),
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.devices).toEqual(mockDevices);
    expect(mockDeviceApi.getDevices).toHaveBeenCalledTimes(1);
  });

  it('handles API errors gracefully', async () => {
    mockDeviceApi.getDevices.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useDevices(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('API Error');
    expect(result.current.devices).toEqual([]);
  });
});
```

---

## 🔧 Code Quality Standards

### **1. TypeScript Configuration**

```json
// tsconfig.json - Strict TypeScript configuration
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    
    // Strict Type Checking
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    
    // Additional Checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitThis": true,
    
    // Path Mapping
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/services/*": ["./src/services/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### **2. ESLint Configuration**

```json
// .eslintrc.js - Comprehensive linting rules
{
  "extends": [
    "@typescript-eslint/recommended",
    "react-hooks/exhaustive-deps",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    // React Rules
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "react/jsx-props-no-spreading": "warn",
    "react/jsx-no-bind": "warn",
    
    // TypeScript Rules
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/prefer-readonly": "error",
    
    // Code Quality Rules
    "max-lines-per-function": ["error", 150],
    "max-params": ["error", 5],
    "max-depth": ["error", 3],
    "complexity": ["error", 10],
    
    // Import Rules
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling"],
      "newlines-between": "always"
    }],
    
    // Accessibility Rules
    "jsx-a11y/label-has-associated-control": "error",
    "jsx-a11y/no-autofocus": "warn"
  }
}
```

### **3. Performance Requirements**

- **Bundle Size**: Main bundle < 500KB gzipped
- **Component Render**: < 16ms for 60fps performance  
- **Memory Usage**: < 50MB heap size during normal usage
- **First Contentful Paint**: < 1.5 seconds
- **Time to Interactive**: < 3 seconds

---

This architecture guide ensures the BeepMyPhone frontend maintains high code quality, follows React best practices, and provides a maintainable, scalable foundation for the desktop application interface.