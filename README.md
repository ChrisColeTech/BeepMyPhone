# BeepMyPhone 📱

> **Real-time Windows-to-iOS notification forwarding system**

BeepMyPhone bridges the gap between your Windows PC and iOS device by instantly forwarding Windows notifications to your iPhone/iPad. Never miss an important notification when you're away from your computer!

## 🚀 Features

- **Real-time notification forwarding** from Windows PC to iOS devices
- **Cross-platform architecture** with C#/.NET backend and Swift iOS app
- **Desktop management interface** built with React + Electron
- **SignalR WebSocket communication** for instant delivery
- **Customizable notification filtering** and formatting
- **Multiple device support** - connect multiple iOS devices
- **Background operation** - works even when apps are backgrounded
- **Secure local network communication** - no cloud dependencies

## 📋 System Requirements

### Windows PC (Backend)
- **OS**: Windows 10/11 or WSL2
- **.NET**: 8.0 or higher
- **Network**: Local network access
- **Permissions**: Access to Windows notification database

### iOS Device (Mobile App)
- **OS**: iOS 14.0+ 
- **Device**: iPhone/iPad with notification permissions
- **Network**: Same local network as Windows PC
- **Storage**: ~10MB app storage

### Development Environment
- **Node.js**: 18.0+ (for frontend development)
- **Xcode**: 14.0+ (for iOS development)
- **Git**: For version control

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Windows PC    │    │   .NET Backend   │    │   iOS Device    │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │Notification │ │    │ │   SignalR    │ │    │ │    Swift    │ │
│ │  Database   │────────│     Hub      │────────│     App     │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │   Electron  │ │    │ │  REST API    │ │    │ │ Local Notif │ │
│ │   Desktop   │────────│  Controllers │ │    │ │   System    │ │
│ │     App     │ │    │ └──────────────┘ │    │ └─────────────┘ │
│ └─────────────┘ │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔄 Notification Pipeline Flow

### Complete End-to-End Process

#### 1. **Windows Notification Capture** 📥
```
Windows System → Notification Database → NotificationMonitorService
```
- **Location**: `%LocalAppData%\Microsoft\Windows\Notifications\wpndatabase.db`
- **Monitor**: FileSystemWatcher detects database changes
- **Trigger**: Fires `NotificationReceived` event with notification data

#### 2. **Event Processing & Formatting** ⚙️
```csharp
// NotificationBroadcastService.cs
private async void OnNotificationReceived(WindowsNotification notification)
{
    var formattedNotification = _formatter.FormatForMobile(notification);
    var activeDevices = await _deviceService.GetActiveDevicesAsync();
    await BroadcastToActiveDevices(notification, formattedNotification);
}
```
- **Input**: Raw Windows notification
- **Process**: Format for mobile display, identify active devices
- **Output**: Structured notification ready for mobile

#### 3. **SignalR Real-time Distribution** 📡
```csharp
// SignalR Hub broadcast
await _hubContext.Clients.All.SendAsync("NotificationReceived", new {
    Original = originalNotification,
    Formatted = mobileFormattedNotification
});
```
- **Protocol**: WebSocket via SignalR
- **Target**: All connected iOS devices
- **Payload**: Original + mobile-optimized notification data

#### 4. **iOS Device Connection & Registration** 📱
```swift
// iOS SignalR Connection Flow
// Step 1: Negotiate connection
POST /notificationHub/negotiate → connectionId

// Step 2: WebSocket connection  
ws://server:5001/notificationHub?id=connectionId

// Step 3: Device registration
{
    "type": 1,
    "target": "RegisterDevice", 
    "arguments": ["deviceId", "deviceName", "iOS"]
}
```

#### 5. **iOS Notification Reception & Display** 🔔
```swift
// SignalRService.swift - Message handling
if message.contains("NotificationReceived") {
    let notification = try JSONDecoder().decode(WindowsNotification.self, from: data)
    showLocalNotification(notification.formatted.displayTitle, 
                         notification.formatted.displayMessage)
}
```
- **Reception**: Parse SignalR WebSocket message
- **Processing**: Decode JSON to Swift notification model
- **Display**: Create native iOS notification via UNUserNotificationCenter

### 🔍 Technical Implementation Details

#### Backend Services (.NET 8.0)
- **NotificationMonitorService**: Monitors Windows notification database
- **NotificationBroadcastService**: Handles real-time distribution via SignalR
- **DeviceManagementService**: Manages connected device registry
- **NotificationFormatterService**: Formats notifications for mobile display

#### iOS App (Swift/SwiftUI)
- **SignalRService**: Manages WebSocket connection and SignalR protocol
- **NotificationService**: Handles local iOS notification display
- **ContentView**: Main app interface with connection status
- **SettingsView**: Server configuration and device management

#### Desktop App (React + Electron)
- **Device Management**: View and manage connected devices
- **Notification History**: Browse recent notifications
- **Test Notifications**: Send test notifications to devices
- **System Monitoring**: View service status and statistics

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/BeepMyPhone.git
cd BeepMyPhone
```

### 2. Start Backend Service
```bash
cd backend/app
dotnet run --urls=http://0.0.0.0:5001
```
**Backend will be available at**: `http://localhost:5001`

### 3. Start Desktop App (Optional)
```bash
# In project root
npm install
npm run dev
```
**Desktop app will be available at**: `http://localhost:5173`

### 4. Configure iOS App
1. Build and install iOS app via Xcode
2. Open app and go to Settings
3. Enter your PC's IP address: `192.168.1.100:5001`
4. Set device name and tap "Reconnect"
5. Grant notification permissions when prompted

### 5. Test Notification Flow
```bash
# Test the complete pipeline
./test_notification_pipeline.sh

# Or manually test via API
curl -X POST http://localhost:5001/api/notifications/devices/{device-id}/test \
  -H "Content-Type: application/json" \
  -d '{"message": "Test notification from BeepMyPhone!"}'
```

## 🔧 Configuration

### Backend Configuration
```csharp
// Program.cs - Server binding
app.Urls.Add("http://0.0.0.0:5001");

// CORS configuration for frontend
options.AddPolicy("AllowFrontend", policy => {
    policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
          .AllowAnyHeader()
          .AllowAnyMethod()
          .AllowCredentials();
});
```

### iOS App Configuration
- **Server URL**: Your PC's IP address with port (e.g., `192.168.1.100:5001`)
- **Device Name**: Friendly name for your device
- **Auto-connect**: Automatically connects on app launch
- **Settings Persistence**: Configuration saved in UserDefaults

### Network Requirements
- **Same Network**: iOS device and PC must be on same local network
- **Port Access**: Port 5001 must be accessible from iOS to PC
- **Firewall**: Ensure Windows Firewall allows connections on port 5001

## 🧪 Testing & Verification

### Test Complete Pipeline
```bash
# Run comprehensive pipeline test
chmod +x test_notification_pipeline.sh
./test_notification_pipeline.sh
```

### Manual API Testing
```bash
# Check service health
curl http://localhost:5001/health

# List registered devices  
curl http://localhost:5001/api/notifications/devices

# Send test notification
curl -X POST http://localhost:5001/api/notifications/devices/{device-id}/test \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from BeepMyPhone!"}'

# View recent notifications
curl http://localhost:5001/api/notifications/recent?count=10
```

### Troubleshooting Connection Issues
1. **Check network connectivity**: `ping {pc-ip-address}`
2. **Verify backend is running**: `curl http://{pc-ip}:5001/health`
3. **Test SignalR negotiation**: `curl -X POST http://{pc-ip}:5001/notificationHub/negotiate`
4. **Check iOS app logs** for connection errors
5. **Verify firewall settings** on Windows PC

## 📱 iOS App Features

### Main Interface
- **Connection Status**: Real-time connection indicator
- **Recent Notifications**: List of notifications received from PC
- **Notification History**: Persistent storage of received notifications
- **Settings Access**: Configure server connection

### Settings Screen
- **Server URL Configuration**: Set PC IP address and port
- **Device Name**: Customize device identification
- **Connection Management**: Manual reconnect capability
- **Device Information**: View device ID and connection status

### Background Operation
- **Background Tasks**: Maintains connection when app is backgrounded
- **Background Fetch**: Periodic connection health checks
- **Notification Permissions**: Request and manage iOS notification access

## 🔒 Security & Privacy

### Local Network Only
- **No Cloud Dependencies**: All communication stays on local network
- **Direct PC-to-Phone**: No data passes through external servers
- **Network Isolation**: Only devices on same network can connect

### Data Handling
- **Temporary Storage**: Notifications stored temporarily on device
- **No Persistent Logs**: Sensitive notification content not permanently logged
- **Device Registration**: Only device ID and name stored on backend

## 🚀 Development

### Project Structure
```
BeepMyPhone/
├── backend/app/                 # .NET 8.0 Web API
│   ├── Controllers/            # REST API endpoints
│   ├── Services/               # Business logic services
│   ├── Hubs/                   # SignalR hubs
│   └── Models/                 # Data models
├── frontend/app/               # React + Vite frontend  
│   ├── src/components/         # React components
│   ├── src/pages/              # Page components
│   └── src/services/           # API services
├── electron/app/               # Electron desktop wrapper
├── mobile/iOS/                 # Swift iOS app
│   └── BeepMyPhone/
│       ├── Services/           # SignalR & Notification services
│       └── Views/              # SwiftUI views
└── docs/                       # Documentation
```

### Development Commands
```bash
# Start all services in development mode
npm run dev

# Build all components
npm run build

# Backend only
npm run backend

# Frontend only  
npm run frontend

# Electron app only
npm run electron
```

### Building for Production
```bash
# Build backend
cd backend/app && dotnet publish -c Release

# Build frontend
cd frontend/app && npm run build

# Build Electron app
cd electron/app && npm run build

# Build iOS app via Xcode
open mobile/iOS/BeepMyPhone/BeepMyPhone.xcodeproj
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow C# coding conventions for backend
- Use TypeScript for frontend development
- Follow Swift/SwiftUI patterns for iOS
- Add tests for new features
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **SignalR** for real-time communication
- **React + Electron** for cross-platform desktop UI
- **Swift/SwiftUI** for iOS native experience
- **.NET 8.0** for robust backend services

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/BeepMyPhone/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/BeepMyPhone/discussions)
- **Documentation**: [Wiki](https://github.com/YOUR_USERNAME/BeepMyPhone/wiki)

---

**Made with ❤️ for seamless cross-platform notifications**