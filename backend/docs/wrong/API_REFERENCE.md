# BeepMyPhone Backend API Reference

This document provides comprehensive documentation for all REST API endpoints, WebSocket events, and integration interfaces for the BeepMyPhone backend system, ensuring complete compliance with architectural standards defined in ARCHITECTURE.md.

## 📋 API Overview

**Base URL**: `http://localhost:3000/api/v1`  
**WebSocket URL**: `ws://localhost:3001`  
**API Version**: v1  
**Content Type**: `application/json`  
**Architecture**: RESTful design following SOLID principles  

## 🔐 Authentication

BeepMyPhone implements JWT-based authentication following the security standards defined in ARCHITECTURE.md with comprehensive token management and device authorization.

### **Authentication Flow**

1. **Device Registration**: Secure device pairing with time-limited registration codes
2. **Token Exchange**: JWT access and refresh token generation
3. **API Access**: Bearer token authentication for all protected endpoints
4. **Token Refresh**: Automatic token renewal with refresh tokens

### **Authentication Headers**

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
X-Device-ID: <device_identifier>
```

### **Security Standards**

- **Encryption**: AES-256 for notification content
- **Token Expiry**: Access tokens expire in 1 hour, refresh tokens in 30 days
- **Rate Limiting**: Implemented per endpoint category
- **Audit Logging**: All authentication events logged

---

## 🛡️ Security & Rate Limiting

### **Rate Limits (Per Device)**

| Endpoint Category | Requests per Minute | Burst Limit | Daily Limit |
|------------------|-------------------|-------------|-------------|
| Authentication   | 10                | 20          | 100         |
| Device Management| 60                | 100         | 1,000       |
| Notifications    | 1000              | 1500        | 50,000      |
| System/Health    | 30                | 50          | 500         |
| Filter Management| 20                | 30          | 200         |

### **Error Response Format**

Following ARCHITECTURE.md typed error patterns:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "field": "deviceName",
      "reason": "Device name must be between 1 and 50 characters",
      "allowedValues": null
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789",
    "retryAfter": null
  }
}
```

---

## 🔑 Authentication Endpoints

### **POST /auth/register**

Register a new device for notification forwarding with secure pairing process.

#### **Request**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "deviceName": "iPhone 14 Pro",
  "deviceType": "ios",
  "capabilities": {
    "supportsWebSocket": true,
    "supportsHTTP": true,
    "supportsEncryption": true,
    "maxNotificationSize": 4096,
    "platformVersion": "17.2",
    "appVersion": "1.0.0"
  },
  "clientVersion": "1.0.0",
  "networkInfo": {
    "ipAddress": "192.168.1.150",
    "userAgent": "BeepMyPhone-iOS/1.0.0"
  }
}
```

#### **Validation Rules**
- `deviceName`: 1-50 characters, alphanumeric and spaces only
- `deviceType`: Must be one of `["ios", "android", "windows", "macos", "linux"]`
- `capabilities`: Required object with boolean flags
- `clientVersion`: Semantic version format (x.y.z)

#### **Response**
```json
{
  "success": true,
  "data": {
    "registrationCode": "ABC123DEF456",
    "expiresAt": "2024-01-15T11:00:00Z",
    "serverInfo": {
      "version": "1.0.0",
      "capabilities": ["websocket", "http", "encryption", "filtering"],
      "endpoints": {
        "websocket": "ws://192.168.1.100:3001",
        "http": "http://192.168.1.100:3000"
      },
      "maxDevices": 10,
      "supportedPlatforms": ["ios", "android", "windows", "macos", "linux"]
    }
  }
}
```

#### **Status Codes**
- `200 OK` - Registration successful
- `400 Bad Request` - Invalid device data or validation failure
- `409 Conflict` - Device already registered
- `429 Too Many Requests` - Rate limit exceeded
- `503 Service Unavailable` - Maximum devices reached

---

### **POST /auth/token**

Exchange registration code for JWT access and refresh tokens.

#### **Request**
```http
POST /api/v1/auth/token
Content-Type: application/json

{
  "registrationCode": "ABC123DEF456",
  "deviceId": "device_unique_identifier",
  "deviceFingerprint": "sha256_hash_of_device_characteristics"
}
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "refreshExpiresIn": 2592000,
    "scope": ["notifications:receive", "device:manage", "filters:manage"],
    "deviceId": "device_123",
    "deviceStatus": "active"
  }
}
```

#### **Status Codes**
- `200 OK` - Token exchange successful
- `400 Bad Request` - Invalid registration code format
- `401 Unauthorized` - Registration code expired or invalid
- `404 Not Found` - Registration code not found

---

### **POST /auth/refresh**

Refresh expired access token using refresh token.

#### **Request**
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "deviceId": "device_123"
}
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "tokenType": "Bearer",
    "scope": ["notifications:receive", "device:manage", "filters:manage"]
  }
}
```

#### **Status Codes**
- `200 OK` - Token refresh successful
- `401 Unauthorized` - Invalid or expired refresh token
- `403 Forbidden` - Device has been revoked

---

### **POST /auth/revoke**

Revoke device access and invalidate all tokens.

#### **Request**
```http
POST /api/v1/auth/revoke
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "revokeAll": false
}
```

#### **Response**
```json
{
  "success": true,
  "message": "Device access revoked successfully"
}
```

---

## 📱 Device Management Endpoints

### **GET /devices**

Retrieve all registered devices with pagination and filtering.

#### **Request**
```http
GET /api/v1/devices?page=1&limit=20&status=online&type=ios
Authorization: Bearer <access_token>
```

#### **Query Parameters**
- `page` (optional): Page number for pagination (default: 1, min: 1)
- `limit` (optional): Items per page (default: 20, min: 1, max: 100)
- `status` (optional): Filter by device status (`online`, `offline`, `inactive`, `all`)
- `type` (optional): Filter by device type (`ios`, `android`, `windows`, `macos`, `linux`, `all`)
- `sortBy` (optional): Sort field (`name`, `lastSeen`, `registeredAt`)
- `sortOrder` (optional): Sort direction (`asc`, `desc`)

#### **Response**
```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "id": "device_123",
        "name": "iPhone 14 Pro",
        "type": "ios",
        "status": "online",
        "lastSeen": "2024-01-15T10:25:00Z",
        "registeredAt": "2024-01-10T08:30:00Z",
        "capabilities": {
          "supportsWebSocket": true,
          "supportsHTTP": true,
          "supportsEncryption": true,
          "maxNotificationSize": 4096,
          "platformVersion": "17.2",
          "appVersion": "1.0.0"
        },
        "connectionInfo": {
          "ipAddress": "192.168.1.150",
          "userAgent": "BeepMyPhone-iOS/1.0.0",
          "connectionType": "websocket"
        },
        "statistics": {
          "notificationsReceived": 1247,
          "notificationsFiltered": 89,
          "lastNotificationAt": "2024-01-15T10:20:00Z",
          "connectionUptime": 86400,
          "averageLatency": 45
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 5,
      "totalPages": 1,
      "hasNext": false,
      "hasPrevious": false
    },
    "summary": {
      "totalDevices": 5,
      "onlineDevices": 3,
      "offlineDevices": 2
    }
  }
}
```

---

### **GET /devices/{deviceId}**

Retrieve specific device details with comprehensive information.

#### **Request**
```http
GET /api/v1/devices/device_123
Authorization: Bearer <access_token>
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "id": "device_123",
    "name": "iPhone 14 Pro",
    "type": "ios",
    "status": "online",
    "registeredAt": "2024-01-10T08:30:00Z",
    "lastSeen": "2024-01-15T10:25:00Z",
    "connectionInfo": {
      "ipAddress": "192.168.1.150",
      "userAgent": "BeepMyPhone-iOS/1.0.0",
      "connectionType": "websocket",
      "lastConnectionAt": "2024-01-15T08:00:00Z",
      "totalConnections": 156
    },
    "capabilities": {
      "supportsWebSocket": true,
      "supportsHTTP": true,
      "supportsEncryption": true,
      "maxNotificationSize": 4096,
      "platformVersion": "17.2",
      "appVersion": "1.0.0"
    },
    "settings": {
      "notificationsEnabled": true,
      "quietHours": {
        "enabled": true,
        "startTime": "22:00",
        "endTime": "07:00",
        "timezone": "America/New_York"
      },
      "filteringEnabled": true,
      "encryptionEnabled": true
    },
    "statistics": {
      "notificationsReceived": 1247,
      "notificationsFiltered": 89,
      "notificationsDelivered": 1158,
      "lastNotificationAt": "2024-01-15T10:20:00Z",
      "averageLatency": 45,
      "connectionUptime": 86400,
      "deliverySuccessRate": 99.2
    },
    "health": {
      "batteryOptimized": true,
      "networkStability": "excellent",
      "performanceScore": 95
    }
  }
}
```

#### **Status Codes**
- `200 OK` - Device found and returned
- `401 Unauthorized` - Invalid or missing authentication
- `403 Forbidden` - Access denied for this device
- `404 Not Found` - Device not found

---

### **PUT /devices/{deviceId}**

Update device settings and configuration.

#### **Request**
```http
PUT /api/v1/devices/device_123
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "John's iPhone",
  "settings": {
    "notificationsEnabled": true,
    "quietHours": {
      "enabled": true,
      "startTime": "23:00",
      "endTime": "06:00",
      "timezone": "America/New_York"
    },
    "filteringEnabled": true,
    "encryptionEnabled": true
  }
}
```

#### **Validation Rules**
- `name`: 1-50 characters, must be unique per user
- `settings.quietHours.startTime`/`endTime`: HH:MM format (24-hour)
- `settings.quietHours.timezone`: Valid IANA timezone identifier

#### **Response**
```json
{
  "success": true,
  "data": {
    "id": "device_123",
    "name": "John's iPhone",
    "settings": {
      "notificationsEnabled": true,
      "quietHours": {
        "enabled": true,
        "startTime": "23:00",
        "endTime": "06:00",
        "timezone": "America/New_York"
      },
      "filteringEnabled": true,
      "encryptionEnabled": true
    },
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### **Status Codes**
- `200 OK` - Device updated successfully
- `400 Bad Request` - Invalid data or validation error
- `401 Unauthorized` - Invalid authentication
- `403 Forbidden` - Access denied
- `404 Not Found` - Device not found
- `409 Conflict` - Device name already exists

---

### **DELETE /devices/{deviceId}**

Unregister and remove a device permanently.

#### **Request**
```http
DELETE /api/v1/devices/device_123
Authorization: Bearer <access_token>
```

#### **Response**
```json
{
  "success": true,
  "message": "Device successfully unregistered",
  "data": {
    "deviceId": "device_123",
    "unregisteredAt": "2024-01-15T10:35:00Z",
    "statistics": {
      "totalNotifications": 1247,
      "activeTime": 432000,
      "lastSeen": "2024-01-15T10:25:00Z"
    }
  }
}
```

#### **Status Codes**
- `200 OK` - Device deleted successfully
- `401 Unauthorized` - Invalid authentication
- `403 Forbidden` - Cannot delete this device
- `404 Not Found` - Device not found

---

## 🔔 Notification Endpoints

### **GET /notifications**

Retrieve notification history with advanced filtering and pagination.

#### **Request**
```http
GET /api/v1/notifications?deviceId=device_123&limit=50&status=delivered&startDate=2024-01-10T00:00:00Z
Authorization: Bearer <access_token>
```

#### **Query Parameters**
- `deviceId` (optional): Filter by specific device
- `startDate` (optional): Filter from date (ISO 8601 format)
- `endDate` (optional): Filter to date (ISO 8601 format)
- `status` (optional): Filter by status (`delivered`, `failed`, `pending`, `filtered`)
- `application` (optional): Filter by source application name
- `priority` (optional): Filter by priority (`low`, `normal`, `high`, `critical`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 500)
- `sortBy` (optional): Sort field (`timestamp`, `application`, `priority`)
- `sortOrder` (optional): Sort direction (`asc`, `desc`)

#### **Response**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_789",
        "title": "New Email",
        "body": "You have received a new email from john@example.com",
        "application": "Mail",
        "icon": "data:image/png;base64,iVBOR...",
        "priority": "normal",
        "timestamp": "2024-01-15T10:20:00Z",
        "deviceId": "device_123",
        "status": "delivered",
        "deliveredAt": "2024-01-15T10:20:01Z",
        "latency": 45,
        "encrypted": true,
        "metadata": {
          "sender": "Mail.app",
          "category": "email",
          "actions": ["reply", "archive"],
          "platform": "windows",
          "urgency": "normal"
        },
        "filterInfo": {
          "processed": true,
          "rulesApplied": ["rule_1"],
          "action": "allow"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "totalItems": 1247,
      "totalPages": 25,
      "hasNext": true,
      "hasPrevious": false
    },
    "summary": {
      "totalNotifications": 1247,
      "deliveredCount": 1158,
      "failedCount": 5,
      "filteredCount": 89,
      "averageLatency": 47
    }
  }
}
```

---

### **GET /notifications/{notificationId}**

Retrieve specific notification details.

#### **Request**
```http
GET /api/v1/notifications/notif_789
Authorization: Bearer <access_token>
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "id": "notif_789",
    "title": "New Email",
    "body": "You have received a new email from john@example.com",
    "application": "Mail",
    "icon": "data:image/png;base64,iVBOR...",
    "priority": "normal",
    "timestamp": "2024-01-15T10:20:00Z",
    "deviceId": "device_123",
    "status": "delivered",
    "deliveredAt": "2024-01-15T10:20:01Z",
    "latency": 45,
    "encrypted": true,
    "deliveryAttempts": 1,
    "metadata": {
      "sender": "Mail.app",
      "category": "email",
      "actions": ["reply", "archive"],
      "platform": "windows",
      "urgency": "normal",
      "originalSize": 2048,
      "compressedSize": 1536
    },
    "filterInfo": {
      "processed": true,
      "rulesApplied": ["rule_1"],
      "action": "allow",
      "processingTime": 5
    },
    "deliveryInfo": {
      "method": "websocket",
      "attempts": 1,
      "firstAttemptAt": "2024-01-15T10:20:00Z",
      "deliveredAt": "2024-01-15T10:20:01Z",
      "acknowledgedAt": "2024-01-15T10:20:02Z"
    }
  }
}
```

---

### **POST /notifications/test**

Send a test notification to verify device connectivity.

#### **Request**
```http
POST /api/v1/notifications/test
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "deviceId": "device_123",
  "message": "Test notification from BeepMyPhone",
  "priority": "normal",
  "includeMetrics": true
}
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "id": "notif_test_456",
    "message": "Test notification sent successfully",
    "deliveredAt": "2024-01-15T10:30:00Z",
    "latency": 32,
    "method": "websocket",
    "deviceStatus": "online",
    "metrics": {
      "queueTime": 5,
      "processingTime": 12,
      "deliveryTime": 15,
      "totalTime": 32
    }
  }
}
```

#### **Status Codes**
- `200 OK` - Test notification sent successfully
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Device not found
- `503 Service Unavailable` - Device offline or unreachable

---

## 🎯 Notification Filter Management

### **GET /notifications/filters**

Retrieve notification filtering rules for a device.

#### **Request**
```http
GET /api/v1/notifications/filters?deviceId=device_123&enabled=true
Authorization: Bearer <access_token>
```

#### **Query Parameters**
- `deviceId` (optional): Filter rules for specific device
- `enabled` (optional): Filter by rule status (`true`, `false`)
- `type` (optional): Filter by rule type (`application`, `content`, `time`, `priority`)

#### **Response**
```json
{
  "success": true,
  "data": {
    "rules": [
      {
        "id": "rule_1",
        "name": "Allow Work Apps",
        "description": "Allow notifications from work-related applications",
        "enabled": true,
        "type": "application",
        "condition": "in",
        "values": ["Slack", "Microsoft Teams", "Outlook"],
        "action": "allow",
        "priority": 1,
        "deviceId": "device_123",
        "createdAt": "2024-01-10T09:00:00Z",
        "updatedAt": "2024-01-12T14:30:00Z",
        "statistics": {
          "applicationsCount": 156,
          "blockedCount": 23,
          "lastTriggeredAt": "2024-01-15T09:45:00Z"
        }
      },
      {
        "id": "rule_2",
        "name": "Quiet Hours",
        "description": "Block notifications during specified hours",
        "enabled": true,
        "type": "time",
        "condition": "between",
        "values": ["22:00", "07:00"],
        "action": "block",
        "priority": 2,
        "deviceId": "device_123",
        "days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        "timezone": "America/New_York",
        "exceptions": ["critical"]
      }
    ],
    "summary": {
      "totalRules": 2,
      "enabledRules": 2,
      "disabledRules": 0,
      "totalApplicationsCount": 156,
      "totalBlockedCount": 23
    }
  }
}
```

---

### **POST /notifications/filters**

Create new notification filtering rule.

#### **Request**
```http
POST /api/v1/notifications/filters
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "deviceId": "device_123",
  "name": "Block Social Media",
  "description": "Block notifications from social media apps during work hours",
  "type": "application",
  "condition": "in",
  "values": ["Twitter", "Facebook", "Instagram", "TikTok"],
  "action": "block",
  "enabled": true,
  "schedule": {
    "days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "startTime": "09:00",
    "endTime": "17:00",
    "timezone": "America/New_York"
  }
}
```

#### **Validation Rules**
- `name`: 1-100 characters, unique per device
- `type`: Must be one of `["application", "content", "time", "priority", "sender"]`
- `condition`: Must be valid for the rule type
- `values`: Array of strings, max 50 items
- `action`: Must be one of `["allow", "block", "modify"]`

#### **Response**
```json
{
  "success": true,
  "data": {
    "id": "rule_3",
    "name": "Block Social Media",
    "description": "Block notifications from social media apps during work hours",
    "type": "application",
    "condition": "in",
    "values": ["Twitter", "Facebook", "Instagram", "TikTok"],
    "action": "block",
    "enabled": true,
    "priority": 3,
    "deviceId": "device_123",
    "schedule": {
      "days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
      "startTime": "09:00",
      "endTime": "17:00",
      "timezone": "America/New_York"
    },
    "createdAt": "2024-01-15T10:35:00Z"
  }
}
```

#### **Status Codes**
- `201 Created` - Filter rule created successfully
- `400 Bad Request` - Invalid rule data or validation error
- `409 Conflict` - Rule name already exists for device
- `422 Unprocessable Entity` - Rule logic validation failed

---

### **PUT /notifications/filters/{ruleId}**

Update existing notification filter rule.

#### **Request**
```http
PUT /api/v1/notifications/filters/rule_3
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Block Social Media - Work Hours",
  "enabled": false,
  "values": ["Twitter", "Facebook", "Instagram", "TikTok", "LinkedIn"]
}
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "id": "rule_3",
    "name": "Block Social Media - Work Hours",
    "enabled": false,
    "values": ["Twitter", "Facebook", "Instagram", "TikTok", "LinkedIn"],
    "updatedAt": "2024-01-15T10:40:00Z"
  }
}
```

---

### **DELETE /notifications/filters/{ruleId}**

Delete notification filter rule.

#### **Request**
```http
DELETE /api/v1/notifications/filters/rule_3
Authorization: Bearer <access_token>
```

#### **Response**
```json
{
  "success": true,
  "message": "Filter rule deleted successfully",
  "data": {
    "ruleId": "rule_3",
    "deletedAt": "2024-01-15T10:45:00Z"
  }
}
```

---

## 🔧 System & Health Endpoints

### **GET /system/health**

Get comprehensive system health status and diagnostics.

#### **Request**
```http
GET /api/v1/system/health
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0",
    "uptime": 86400,
    "environment": "production",
    "services": {
      "database": {
        "status": "healthy",
        "responseTime": 5,
        "details": "SQLite connection active",
        "lastCheck": "2024-01-15T10:30:00Z"
      },
      "websocket": {
        "status": "healthy",
        "activeConnections": 12,
        "details": "WebSocket server running on port 3001",
        "lastCheck": "2024-01-15T10:30:00Z"
      },
      "notificationMonitor": {
        "status": "healthy",
        "platform": "windows",
        "details": "UserNotificationListener active",
        "lastNotification": "2024-01-15T10:25:00Z"
      },
      "queueService": {
        "status": "healthy",
        "queueSize": 5,
        "details": "Notification queue operational",
        "lastProcessed": "2024-01-15T10:29:00Z"
      }
    },
    "metrics": {
      "notificationsProcessed": 15678,
      "devicesConnected": 12,
      "averageLatency": 47,
      "errorRate": 0.02,
      "queuedNotifications": 5
    },
    "platformSupport": {
      "windows": true,
      "linux": true,
      "macos": false
    }
  }
}
```

#### **Status Codes**
- `200 OK` - Health check successful
- `503 Service Unavailable` - One or more services unhealthy

---

### **GET /system/metrics**

Get detailed system performance metrics and statistics.

#### **Request**
```http
GET /api/v1/system/metrics?timeRange=24h&includeHistorical=true
Authorization: Bearer <access_token>
```

#### **Query Parameters**
- `timeRange` (optional): Time range for metrics (`1h`, `24h`, `7d`, `30d`)
- `includeHistorical` (optional): Include historical data points
- `granularity` (optional): Data granularity (`minute`, `hour`, `day`)

#### **Response**
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-15T10:30:00Z",
    "timeRange": "24h",
    "system": {
      "cpu": {
        "usage": 4.2,
        "loadAverage": [0.8, 0.9, 1.1],
        "cores": 8
      },
      "memory": {
        "used": 89456640,
        "free": 134217728,
        "total": 223674368,
        "percentage": 40,
        "cached": 45678912
      },
      "disk": {
        "used": 1024000000,
        "free": 9216000000,
        "total": 10240000000,
        "percentage": 10,
        "databaseSize": 52428800
      },
      "network": {
        "bytesIn": 1234567890,
        "bytesOut": 987654321,
        "packetsIn": 1234567,
        "packetsOut": 987654
      }
    },
    "notifications": {
      "totalProcessed": 15678,
      "successRate": 99.98,
      "failureRate": 0.02,
      "averageLatency": 47,
      "maxLatency": 2340,
      "throughputPerMinute": 125,
      "queuedCount": 5,
      "filteredCount": 892,
      "byPlatform": {
        "windows": 12456,
        "linux": 3222,
        "macos": 0
      },
      "byPriority": {
        "low": 8934,
        "normal": 6234,
        "high": 456,
        "critical": 54
      }
    },
    "connections": {
      "websocket": {
        "active": 12,
        "total": 45,
        "averageUptime": 7200,
        "reconnections": 23,
        "messagesSent": 15678,
        "messagesReceived": 3456
      },
      "http": {
        "requestsPerMinute": 89,
        "averageResponseTime": 23,
        "totalRequests": 567890,
        "errorRate": 0.01
      }
    },
    "errors": {
      "last24Hours": 3,
      "errorRate": 0.02,
      "mostCommon": [
        {
          "type": "CONNECTION_TIMEOUT",
          "count": 2,
          "lastOccurrence": "2024-01-15T08:15:00Z"
        }
      ],
      "byCategory": {
        "network": 1,
        "authentication": 0,
        "validation": 2,
        "system": 0
      }
    },
    "historical": {
      "dataPoints": [
        {
          "timestamp": "2024-01-15T09:30:00Z",
          "notificationsProcessed": 125,
          "averageLatency": 45,
          "activeConnections": 11
        }
      ]
    }
  }
}
```

---

### **GET /system/logs**

Retrieve system logs with filtering capabilities.

#### **Request**
```http
GET /api/v1/system/logs?level=error&limit=100&startDate=2024-01-15T00:00:00Z
Authorization: Bearer <access_token>
```

#### **Query Parameters**
- `level` (optional): Log level (`debug`, `info`, `warn`, `error`, `fatal`)
- `category` (optional): Log category (`auth`, `notification`, `device`, `system`)
- `startDate` (optional): Filter from date (ISO 8601)
- `endDate` (optional): Filter to date (ISO 8601)
- `limit` (optional): Maximum entries (default: 100, max: 1000)

#### **Response**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "timestamp": "2024-01-15T10:25:00Z",
        "level": "error",
        "category": "notification",
        "message": "Failed to deliver notification to device_456",
        "details": {
          "deviceId": "device_456",
          "notificationId": "notif_789",
          "error": "CONNECTION_TIMEOUT",
          "retryCount": 3
        },
        "requestId": "req_123456"
      }
    ],
    "summary": {
      "totalEntries": 1,
      "byLevel": {
        "error": 1,
        "warn": 0,
        "info": 0
      }
    }
  }
}
```

---

## 🔌 WebSocket API

### **Connection Establishment**

Connect to the WebSocket server for real-time notifications with authentication.

```javascript
import io from 'socket.io-client';

const socket = io('ws://localhost:3001', {
  auth: {
    token: 'your_jwt_token',
    deviceId: 'device_123'
  },
  timeout: 20000,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});
```

### **Authentication Events**

#### **authenticate**
Authenticate the WebSocket connection with device information.

```javascript
// Client sends authentication
socket.emit('authenticate', {
  token: 'your_jwt_token',
  deviceId: 'device_123',
  capabilities: {
    supportsWebSocket: true,
    supportsEncryption: true,
    maxNotificationSize: 4096
  }
});

// Server responds with authentication status
socket.on('authenticated', (data) => {
  console.log('Authentication result:', data);
  /*
  {
    "success": true,
    "deviceId": "device_123",
    "serverTime": "2024-01-15T10:30:00Z",
    "queuedNotifications": 3
  }
  */
});

// Authentication error handling
socket.on('auth_error', (error) => {
  console.error('Authentication failed:', error);
  /*
  {
    "code": "AUTH_INVALID_TOKEN",
    "message": "JWT token is invalid or expired"
  }
  */
});
```

### **Notification Events**

#### **notification**
Receive real-time notifications from the server.

```javascript
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
  /*
  {
    "id": "notif_789",
    "title": "New Email",
    "body": "You have received a new email from john@example.com",
    "application": "Mail",
    "icon": "data:image/png;base64,iVBOR...",
    "priority": "normal",
    "timestamp": "2024-01-15T10:20:00Z",
    "encrypted": true,
    "metadata": {
      "sender": "Mail.app",
      "category": "email",
      "actions": ["reply", "archive"],
      "urgency": "normal"
    },
    "deliveryInfo": {
      "attempts": 1,
      "queueTime": 5,
      "processingTime": 12
    }
  }
  */
  
  // Display notification in mobile app
  displayNotification(notification);
  
  // Send acknowledgment
  socket.emit('notification:ack', {
    notificationId: notification.id,
    deliveredAt: new Date().toISOString(),
    displayedAt: new Date().toISOString()
  });
});
```

#### **notification:ack**
Acknowledge notification receipt and display.

```javascript
// Send acknowledgment with delivery confirmation
socket.emit('notification:ack', {
  notificationId: 'notif_789',
  deliveredAt: new Date().toISOString(),
  displayedAt: new Date().toISOString(),
  userAction: 'displayed', // 'displayed', 'dismissed', 'interacted'
  latency: 45
});

// Server confirms acknowledgment
socket.on('notification:ack_received', (data) => {
  console.log('Acknowledgment received:', data);
  /*
  {
    "notificationId": "notif_789",
    "status": "acknowledged",
    "totalLatency": 67
  }
  */
});
```

#### **notification:batch**
Receive multiple notifications in a single event (for offline periods).

```javascript
socket.on('notification:batch', (notifications) => {
  console.log(`Received ${notifications.length} queued notifications`);
  
  notifications.forEach(notification => {
    displayNotification(notification);
  });
  
  // Acknowledge batch receipt
  socket.emit('notification:batch_ack', {
    notificationIds: notifications.map(n => n.id),
    batchProcessedAt: new Date().toISOString()
  });
});
```

### **Device Events**

#### **device:status**
Send device status updates to the server.

```javascript
// Send status update
socket.emit('device:status', {
  status: 'online',
  battery: 85,
  network: 'wifi',
  location: 'home', // optional context
  lastActivity: new Date().toISOString()
});

// Send periodic heartbeat
setInterval(() => {
  socket.emit('device:heartbeat', {
    timestamp: new Date().toISOString(),
    battery: getBatteryLevel(),
    network: getNetworkType()
  });
}, 30000); // Every 30 seconds
```

#### **device:capabilities**
Update device capabilities dynamically.

```javascript
socket.emit('device:capabilities', {
  supportsWebSocket: true,
  supportsHTTP: true,
  supportsEncryption: true,
  maxNotificationSize: 8192, // Increased capability
  platformVersion: "17.3", // Updated OS version
  appVersion: "1.1.0" // Updated app version
});
```

#### **device:settings**
Update device notification settings.

```javascript
socket.emit('device:settings', {
  notificationsEnabled: true,
  quietHours: {
    enabled: true,
    startTime: "22:00",
    endTime: "07:00",
    timezone: "America/New_York"
  },
  filteringEnabled: true
});
```

### **Connection Events**

#### **connect**
Handle successful WebSocket connection.

```javascript
socket.on('connect', () => {
  console.log('Connected to BeepMyPhone server');
  console.log('Socket ID:', socket.id);
  
  // Send authentication immediately
  socket.emit('authenticate', {
    token: localStorage.getItem('accessToken'),
    deviceId: getDeviceId()
  });
});
```

#### **disconnect**
Handle WebSocket disconnection with reconnection logic.

```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected from server:', reason);
  
  if (reason === 'io server disconnect') {
    // Server initiated disconnect, manual reconnection required
    console.log('Server disconnected the client');
  } else {
    // Network/client issue, socket.io will auto-reconnect
    console.log('Connection lost, attempting to reconnect...');
  }
});
```

#### **connect_error**
Handle connection errors with retry logic.

```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  
  if (error.message === 'Authentication failed') {
    // Refresh token and retry
    refreshAuthToken().then(() => {
      socket.auth.token = getNewToken();
      socket.connect();
    });
  }
});
```

#### **reconnect**
Handle successful reconnection.

```javascript
socket.on('reconnect', (attemptNumber) => {
  console.log(`Reconnected after ${attemptNumber} attempts`);
  
  // Re-authenticate after reconnection
  socket.emit('authenticate', {
    token: localStorage.getItem('accessToken'),
    deviceId: getDeviceId()
  });
});
```

### **Server Events**

#### **server:maintenance**
Server maintenance notifications.

```javascript
socket.on('server:maintenance', (data) => {
  console.log('Server maintenance scheduled:', data);
  /*
  {
    "scheduled": true,
    "startTime": "2024-01-16T02:00:00Z",
    "estimatedDuration": 1800, // seconds
    "message": "Scheduled maintenance for server updates"
  }
  */
  
  // Notify user of upcoming maintenance
  showMaintenanceNotification(data);
});
```

#### **server:config_update**
Server configuration update notifications.

```javascript
socket.on('server:config_update', (data) => {
  console.log('Server configuration updated:', data);
  /*
  {
    "type": "filtering_rules",
    "message": "Notification filtering rules have been updated",
    "requiresReload": false
  }
  */
});
```

---

## 📊 Error Codes

### **Authentication Errors (4xx)**
- `AUTH_INVALID_TOKEN` - JWT token is invalid, malformed, or expired
- `AUTH_MISSING_TOKEN` - Authorization header missing or improperly formatted
- `AUTH_REGISTRATION_EXPIRED` - Registration code has expired
- `AUTH_DEVICE_NOT_FOUND` - Device ID not found in registration
- `AUTH_DEVICE_REVOKED` - Device access has been revoked
- `AUTH_INSUFFICIENT_SCOPE` - Token lacks required permissions

### **Validation Errors (4xx)**
- `VALIDATION_ERROR` - Request data validation failed
- `INVALID_DEVICE_TYPE` - Unsupported or unknown device type
- `INVALID_FILTER_RULE` - Notification filter rule validation failed
- `DEVICE_NAME_TOO_LONG` - Device name exceeds 50 character limit
- `INVALID_DATE_FORMAT` - Date parameter not in ISO 8601 format
- `INVALID_PAGINATION` - Page or limit parameters out of valid range

### **Resource Errors (4xx)**
- `DEVICE_NOT_FOUND` - Requested device does not exist
- `NOTIFICATION_NOT_FOUND` - Requested notification does not exist
- `FILTER_RULE_NOT_FOUND` - Requested filter rule does not exist
- `DUPLICATE_DEVICE_NAME` - Device name already exists
- `DUPLICATE_FILTER_NAME` - Filter rule name already exists

### **System Errors (5xx)**
- `DEVICE_LIMIT_EXCEEDED` - Maximum number of devices registered
- `NOTIFICATION_QUEUE_FULL` - Notification queue at maximum capacity
- `DATABASE_ERROR` - Database operation failed
- `WEBSOCKET_CONNECTION_FAILED` - WebSocket server connection error
- `MONITOR_SERVICE_ERROR` - Platform notification monitor error
- `ENCRYPTION_ERROR` - Notification encryption/decryption failed

### **Rate Limiting Errors (4xx)**
- `RATE_LIMIT_EXCEEDED` - Too many requests within time window
- `DAILY_LIMIT_EXCEEDED` - Daily usage quota exceeded
- `CONCURRENT_LIMIT_EXCEEDED` - Too many concurrent connections

### **Network Errors (5xx)**
- `SERVICE_UNAVAILABLE` - Service temporarily unavailable
- `GATEWAY_TIMEOUT` - Request timeout exceeded
- `NETWORK_ERROR` - Network connectivity issue

---

## 📈 Usage Examples

### **Complete Device Registration Flow**

```javascript
class BeepMyPhoneClient {
  constructor() {
    this.baseURL = 'http://localhost:3000/api/v1';
    this.wsURL = 'ws://localhost:3001';
    this.accessToken = null;
    this.deviceId = this.generateDeviceId();
    this.socket = null;
  }

  async registerDevice() {
    try {
      // 1. Register device with server
      const registrationResponse = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceName: 'iPhone 14 Pro',
          deviceType: 'ios',
          capabilities: {
            supportsWebSocket: true,
            supportsHTTP: true,
            supportsEncryption: true,
            maxNotificationSize: 4096,
            platformVersion: '17.2',
            appVersion: '1.0.0'
          },
          clientVersion: '1.0.0',
          networkInfo: {
            ipAddress: await this.getLocalIP(),
            userAgent: 'BeepMyPhone-iOS/1.0.0'
          }
        })
      });

      if (!registrationResponse.ok) {
        throw new Error('Registration failed');
      }

      const { data: regData } = await registrationResponse.json();
      console.log('Registration successful:', regData);

      // 2. Exchange registration code for tokens
      const tokenResponse = await fetch(`${this.baseURL}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationCode: regData.registrationCode,
          deviceId: this.deviceId,
          deviceFingerprint: await this.generateFingerprint()
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Token exchange failed');
      }

      const { data: tokenData } = await tokenResponse.json();
      this.accessToken = tokenData.accessToken;
      this.refreshToken = tokenData.refreshToken;
      
      // Store tokens securely
      await this.storeTokens(tokenData);

      // 3. Establish WebSocket connection
      await this.connectWebSocket();

      return {
        success: true,
        deviceId: tokenData.deviceId,
        serverInfo: regData.serverInfo
      };

    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async connectWebSocket() {
    return new Promise((resolve, reject) => {
      this.socket = io(this.wsURL, {
        auth: {
          token: this.accessToken,
          deviceId: this.deviceId
        },
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      // Handle successful connection
      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.setupEventHandlers();
        resolve();
      });

      // Handle authentication
      this.socket.on('authenticated', (data) => {
        console.log('WebSocket authenticated:', data);
        if (data.queuedNotifications > 0) {
          console.log(`${data.queuedNotifications} notifications waiting`);
        }
      });

      // Handle connection errors
      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        reject(error);
      });

      // Handle authentication errors
      this.socket.on('auth_error', async (error) => {
        console.error('WebSocket auth error:', error);
        
        if (error.code === 'AUTH_INVALID_TOKEN') {
          try {
            await this.refreshAccessToken();
            this.socket.auth.token = this.accessToken;
            this.socket.connect();
          } catch (refreshError) {
            reject(refreshError);
          }
        } else {
          reject(error);
        }
      });
    });
  }

  setupEventHandlers() {
    // Handle incoming notifications
    this.socket.on('notification', (notification) => {
      console.log('New notification:', notification);
      
      // Display notification in app
      this.displayNotification(notification);
      
      // Send acknowledgment
      this.socket.emit('notification:ack', {
        notificationId: notification.id,
        deliveredAt: new Date().toISOString(),
        displayedAt: new Date().toISOString(),
        userAction: 'displayed'
      });
    });

    // Handle batch notifications (offline recovery)
    this.socket.on('notification:batch', (notifications) => {
      console.log(`Received ${notifications.length} queued notifications`);
      
      notifications.forEach(notification => {
        this.displayNotification(notification);
      });
      
      this.socket.emit('notification:batch_ack', {
        notificationIds: notifications.map(n => n.id),
        batchProcessedAt: new Date().toISOString()
      });
    });

    // Send periodic status updates
    this.startStatusUpdates();
  }

  async refreshAccessToken() {
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refreshToken: this.refreshToken,
        deviceId: this.deviceId
      })
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const { data } = await response.json();
    this.accessToken = data.accessToken;
    await this.storeTokens(data);
  }

  startStatusUpdates() {
    // Send heartbeat every 30 seconds
    setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('device:heartbeat', {
          timestamp: new Date().toISOString(),
          battery: this.getBatteryLevel(),
          network: this.getNetworkType(),
          memoryUsage: this.getMemoryUsage()
        });
      }
    }, 30000);
  }

  async createNotificationFilter() {
    const response = await fetch(`${this.baseURL}/notifications/filters`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deviceId: this.deviceId,
        name: 'Work Hours Only',
        description: 'Only allow work-related notifications during business hours',
        type: 'application',
        condition: 'in',
        values: ['Slack', 'Microsoft Teams', 'Outlook', 'Calendar'],
        action: 'allow',
        enabled: true,
        schedule: {
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          startTime: '09:00',
          endTime: '17:00',
          timezone: 'America/New_York'
        }
      })
    });

    if (!response.ok) {
      throw new Error('Filter creation failed');
    }

    const { data } = await response.json();
    console.log('Filter created:', data);
    return data;
  }

  async sendTestNotification() {
    const response = await fetch(`${this.baseURL}/notifications/test`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deviceId: this.deviceId,
        message: 'Test notification from BeepMyPhone API',
        priority: 'normal',
        includeMetrics: true
      })
    });

    if (!response.ok) {
      throw new Error('Test notification failed');
    }

    const { data } = await response.json();
    console.log('Test notification sent:', data);
    return data;
  }

  // Utility methods
  generateDeviceId() {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async generateFingerprint() {
    // Generate device fingerprint based on device characteristics
    const characteristics = {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${screen.width}x${screen.height}`,
      timestamp: Date.now()
    };
    
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(characteristics));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async storeTokens(tokenData) {
    // Securely store tokens (implementation depends on platform)
    localStorage.setItem('beep_access_token', tokenData.accessToken);
    localStorage.setItem('beep_refresh_token', tokenData.refreshToken);
    localStorage.setItem('beep_expires_at', new Date(Date.now() + tokenData.expiresIn * 1000).toISOString());
  }

  displayNotification(notification) {
    // Implementation depends on mobile platform
    console.log('Displaying notification:', notification.title);
    
    // Example for web/Cordova
    if ('Notification' in window) {
      new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon,
        tag: notification.id
      });
    }
  }

  getBatteryLevel() {
    // Implementation depends on platform
    return Math.floor(Math.random() * 100); // Mock implementation
  }

  getNetworkType() {
    // Implementation depends on platform
    return navigator.onLine ? 'wifi' : 'offline';
  }

  getMemoryUsage() {
    // Implementation depends on platform
    return performance.memory ? performance.memory.usedJSHeapSize : 0;
  }

  async getLocalIP() {
    // Simplified IP detection
    return '192.168.1.150';
  }
}

// Usage
const client = new BeepMyPhoneClient();
await client.registerDevice();
```

### **Advanced Filter Management**

```javascript
class FilterManager {
  constructor(client) {
    this.client = client;
    this.baseURL = client.baseURL;
    this.accessToken = client.accessToken;
    this.deviceId = client.deviceId;
  }

  async createWorkHoursFilter() {
    return await this.createFilter({
      name: 'Work Hours Focus',
      description: 'Block distracting apps during work hours',
      type: 'application',
      condition: 'not_in',
      values: ['Instagram', 'TikTok', 'Twitter', 'Facebook', 'YouTube'],
      action: 'block',
      schedule: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'America/New_York'
      },
      exceptions: ['critical', 'work-related']
    });
  }

  async createQuietHoursFilter() {
    return await this.createFilter({
      name: 'Quiet Hours',
      description: 'Block all non-critical notifications during sleep hours',
      type: 'priority',
      condition: 'not_equals',
      values: ['critical'],
      action: 'block',
      schedule: {
        days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        startTime: '22:00',
        endTime: '07:00',
        timezone: 'America/New_York'
      }
    });
  }

  async createContentFilter() {
    return await this.createFilter({
      name: 'Privacy Filter',
      description: 'Redact sensitive information from notifications',
      type: 'content',
      condition: 'contains_regex',
      values: [
        '\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b', // Credit card numbers
        '\\b\\d{3}-\\d{2}-\\d{4}\\b', // SSN
        '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b' // Email addresses
      ],
      action: 'modify',
      modificationRules: {
        replacement: '[REDACTED]',
        preserveLength: false
      }
    });
  }

  async createFilter(filterData) {
    const response = await fetch(`${this.baseURL}/notifications/filters`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deviceId: this.deviceId,
        ...filterData,
        enabled: true
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Filter creation failed: ${error.error.message}`);
    }

    const { data } = await response.json();
    console.log('Filter created:', data);
    return data;
  }

  async getAllFilters() {
    const response = await fetch(
      `${this.baseURL}/notifications/filters?deviceId=${this.deviceId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch filters');
    }

    const { data } = await response.json();
    return data.rules;
  }

  async updateFilter(ruleId, updates) {
    const response = await fetch(`${this.baseURL}/notifications/filters/${ruleId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error('Filter update failed');
    }

    const { data } = await response.json();
    return data;
  }

  async deleteFilter(ruleId) {
    const response = await fetch(`${this.baseURL}/notifications/filters/${ruleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Filter deletion failed');
    }

    return true;
  }
}
```

This comprehensive API reference provides complete documentation for integrating with the BeepMyPhone backend system, enabling developers to build mobile applications and custom integrations that leverage direct PC-to-phone notification forwarding capabilities while adhering to the architectural standards defined in ARCHITECTURE.md.