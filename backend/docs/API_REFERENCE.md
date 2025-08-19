# BeepMyPhone Backend API Reference

This document provides comprehensive documentation of all public interfaces and APIs for the BeepMyPhone backend notification forwarding system.

## 📡 REST API Endpoints

### **Device Management Endpoints**

#### **POST /api/devices/register**
Register a new mobile device for notification forwarding.

**Request:**
```typescript
interface DeviceRegistrationRequest {
  deviceName: string;
  deviceType: 'android' | 'ios';
  platform: string; // e.g., "Android 12", "iOS 16.1"
}
```

**Response:**
```typescript
interface DeviceRegistrationResponse {
  success: boolean;
  deviceId: string;
  deviceToken: string; // Simple auth token for this device
  message: string;
}
```

**Error Responses:**
- `400 Bad Request`: Invalid device data or missing required fields
- `500 Internal Server Error`: Registration failed

---

#### **GET /api/devices**
List all registered devices.

**Response:**
```typescript
interface DeviceListResponse {
  success: boolean;
  devices: Device[];
}

interface Device {
  deviceId: string;
  deviceName: string;
  deviceType: 'android' | 'ios';
  platform: string;
  isConnected: boolean;
  lastSeen: Date;
  registeredAt: Date;
}
```

---

#### **PUT /api/devices/:deviceId**
Update device information.

**Request:**
```typescript
interface UpdateDeviceRequest {
  deviceName?: string;
  platform?: string;
}
```

**Response:**
```typescript
interface UpdateDeviceResponse {
  success: boolean;
  device: Device;
  message: string;
}
```

**Error Responses:**
- `404 Not Found`: Device not found
- `400 Bad Request`: Invalid update data

---

#### **DELETE /api/devices/:deviceId**
Remove device registration.

**Response:**
```typescript
interface DeleteDeviceResponse {
  success: boolean;
  message: string;
}
```

**Error Responses:**
- `404 Not Found`: Device not found

---

### **Health and Status Endpoints**

#### **GET /api/health**
Get system health status.

**Response:**
```typescript
interface HealthResponse {
  success: boolean;
  status: 'healthy' | 'unhealthy';
  timestamp: Date;
  uptime: number; // seconds
  components: {
    database: 'healthy' | 'unhealthy';
    websocket: 'healthy' | 'unhealthy';
    notifications: 'healthy' | 'unhealthy';
  };
}
```

---

#### **GET /api/status**
Get current system status and connected devices.

**Response:**
```typescript
interface StatusResponse {
  success: boolean;
  server: {
    version: string;
    uptime: number;
    platform: string;
  };
  devices: {
    total: number;
    connected: number;
    lastNotification: Date | null;
  };
  notifications: {
    totalForwarded: number;
    lastHour: number;
  };
}
```

---

## 🔌 WebSocket Events

### **Connection Events**

#### **connect**
Client connects to WebSocket server.

**Server Response:**
```typescript
interface WelcomeMessage {
  type: 'welcome';
  serverId: string;
  serverVersion: string;
}
```

---

#### **authenticate**
Client authenticates WebSocket connection using device token.

**Client Request:**
```typescript
interface AuthenticateRequest {
  type: 'authenticate';
  deviceId: string;
  deviceToken: string;
}
```

**Server Response:**
```typescript
interface AuthenticationResult {
  type: 'auth_result';
  success: boolean;
  deviceId?: string;
  message: string;
}
```

---

### **Notification Events**

#### **notification**
Server sends notification to authenticated device.

**Server to Client:**
```typescript
interface NotificationEvent {
  type: 'notification';
  id: string;
  title: string;
  body: string;
  appName: string;
  timestamp: Date;
  icon?: string; // Base64 encoded icon data
}
```

---

#### **notification_ack**
Client acknowledges notification receipt.

**Client to Server:**
```typescript
interface NotificationAck {
  type: 'notification_ack';
  notificationId: string;
  status: 'received' | 'displayed' | 'failed';
  error?: string;
}
```

---

### **Connection Health Events**

#### **ping**
Server heartbeat to maintain connection.

**Server to Client:**
```typescript
interface PingEvent {
  type: 'ping';
  timestamp: Date;
}
```

#### **pong**
Client heartbeat response.

**Client to Server:**
```typescript
interface PongEvent {
  type: 'pong';
  timestamp: Date;
}
```

---

#### **disconnect**
Client disconnects from WebSocket server.

**Server Response:**
```typescript
interface DisconnectEvent {
  type: 'disconnect';
  reason: string;
  timestamp: Date;
}
```

---

## 🗄️ Database Schema

### **devices Table**
```sql
CREATE TABLE devices (
    device_id TEXT PRIMARY KEY,
    device_name TEXT NOT NULL,
    device_type TEXT NOT NULL CHECK (device_type IN ('android', 'ios')),
    platform TEXT NOT NULL,
    device_token TEXT NOT NULL UNIQUE,
    is_connected BOOLEAN DEFAULT false,
    last_seen DATETIME,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_devices_type ON devices(device_type);
CREATE INDEX idx_devices_connected ON devices(is_connected);
CREATE INDEX idx_devices_last_seen ON devices(last_seen);
```

---

## 🔐 Authentication

### **Device Token Authentication**

**Token Generation:**
- Simple random token generated during device registration
- Tokens are unique per device and stored in database
- No expiration or refresh mechanism (keep it simple)

**Usage:**
- HTTP API: Include `deviceToken` in request body for device-specific operations
- WebSocket: Send `authenticate` message with `deviceId` and `deviceToken`

**Token Format:**
```typescript
// Simple random string - no JWT complexity needed
const deviceToken: string = "abc123def456ghi789"; // 18-character random string
```

---

## ⚠️ Error Handling

### **HTTP Error Format**
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    timestamp: Date;
  };
}
```

### **Common Error Codes**
- `INVALID_REQUEST`: Malformed request data
- `DEVICE_NOT_FOUND`: Device ID not found in database
- `INVALID_TOKEN`: Device token is invalid or missing
- `DATABASE_ERROR`: Database operation failed
- `INTERNAL_ERROR`: Unexpected server error

### **WebSocket Error Format**
```typescript
interface WebSocketError {
  type: 'error';
  code: string;
  message: string;
  timestamp: Date;
}
```

---

## 📊 Usage Examples

### **Device Registration Flow**
```typescript
// 1. Register new device
const registerResponse = await fetch('/api/devices/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deviceName: 'My Android Phone',
    deviceType: 'android',
    platform: 'Android 12'
  })
});

const { deviceId, deviceToken } = await registerResponse.json();

// 2. Connect via WebSocket
const socket = io('ws://localhost:3001');

socket.on('connect', () => {
  // Authenticate the connection
  socket.emit('authenticate', {
    type: 'authenticate',
    deviceId: deviceId,
    deviceToken: deviceToken
  });
});

// 3. Listen for notifications
socket.on('notification', (notification) => {
  console.log('Received notification:', notification);
  
  // Show notification on mobile device
  showMobileNotification(notification);
  
  // Acknowledge receipt
  socket.emit('notification_ack', {
    type: 'notification_ack',
    notificationId: notification.id,
    status: 'displayed'
  });
});

// 4. Handle connection events
socket.on('auth_result', (result) => {
  if (result.success) {
    console.log('Successfully authenticated as', result.deviceId);
  } else {
    console.error('Authentication failed:', result.message);
  }
});
```

### **Health Check Example**
```typescript
// Check if server is healthy
const healthCheck = await fetch('/api/health');
const health = await healthCheck.json();

if (health.status === 'healthy') {
  console.log('Server is running normally');
} else {
  console.log('Server has issues:', health.components);
}
```

This API reference covers all the essential endpoints and WebSocket events needed for the simplified BeepMyPhone notification forwarding system, focusing on core functionality without unnecessary complexity.