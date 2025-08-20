# BeepMyPhone iOS App 📱

> **Native iOS companion app for receiving Windows PC notifications in real-time**

The BeepMyPhone iOS app connects to your Windows PC running the BeepMyPhone backend service to receive Windows notifications directly on your iPhone or iPad. Built with Swift and SwiftUI for optimal iOS integration.

## 🚀 Features

- **Real-time Notifications**: Receive Windows notifications instantly via SignalR
- **Native iOS Integration**: Uses UNUserNotificationCenter for system notifications
- **Background Operation**: Maintains connection when app is backgrounded
- **Auto-Connect**: Automatically reconnects to saved server configuration
- **Settings Persistence**: Server settings saved across app launches
- **Connection Status**: Visual indicators for connection health
- **Notification History**: View recent notifications from your PC
- **No Apple Developer account required** for local development

## 📋 Requirements

- **iOS**: 14.0 or later
- **Device**: iPhone or iPad
- **Network**: Same local network as Windows PC running BeepMyPhone backend
- **Permissions**: Notification access (requested on first launch)

## 🏗️ Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    iOS App Architecture                     │
├─────────────────────────────────────────────────────────────┤
│  ContentView (SwiftUI)                                      │
│  ├── ConnectionStatusView (Connection indicator)            │
│  ├── NotificationListView (Recent notifications)           │
│  └── SettingsView (Server configuration)                   │
├─────────────────────────────────────────────────────────────┤
│  Services Layer                                             │
│  ├── SignalRService (WebSocket + SignalR protocol)         │
│  └── NotificationService (iOS notification handling)       │
├─────────────────────────────────────────────────────────────┤
│  iOS System Integration                                     │
│  ├── UNUserNotificationCenter (System notifications)       │
│  ├── Background Tasks (Connection maintenance)             │
│  └── UserDefaults (Settings persistence)                   │
└─────────────────────────────────────────────────────────────┘
```

### Component Details

1. **BeepMyPhoneApp.swift** - Main SwiftUI app entry point
2. **ContentView.swift** - Main UI with notification list and status
3. **SignalRService.swift** - WebSocket connection to backend with proper SignalR negotiation
4. **NotificationService.swift** - Local iOS notification management

### Complete Pipeline Flow

```
Windows PC → NotificationMonitorService → SignalR Hub → iOS App → Local iOS Notification
```

## 🔄 SignalR Connection Flow

### 1. App Launch & Configuration
```swift
// SignalRService.swift - Auto-connect on launch
private func loadSavedSettings() {
    if let savedURL = UserDefaults.standard.string(forKey: "serverURL") {
        self.serverURL = savedURL
        // Auto-connect if we have saved settings
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.connectWebSocket()
        }
    }
}
```

### 2. SignalR Negotiation & Connection
```swift
// Two-step SignalR connection process
private func connectWebSocket() {
    // Step 1: Negotiate with SignalR hub
    negotiateSignalRConnection { connectionId in
        // Step 2: Connect WebSocket with connection ID
        let wsURL = URL(string: "ws://\(serverURL)/notificationHub?id=\(connectionId)")!
        self.webSocketTask = urlSession.webSocketTask(with: wsURL)
        self.webSocketTask?.resume()
        
        // Step 3: Register device with hub
        self.registerDevice()
    }
}
```

### 3. Device Registration
```swift
// Register device with SignalR hub for targeted messaging
private func registerDevice() {
    let registerMessage = """
    {
        "type": 1,
        "target": "RegisterDevice",
        "arguments": ["\(deviceId)", "\(deviceName)", "\(deviceType)"]
    }
    """
    webSocketTask?.send(.string(registerMessage))
}
```

### 4. Notification Reception & Display
```swift
// Parse incoming SignalR messages and display notifications
private func parseSignalRMessage(_ message: String) {
    if message.contains("NotificationReceived") {
        let notification = try JSONDecoder().decode(WindowsNotification.self, from: data)
        DispatchQueue.main.async {
            self.notificationCallback?(notification)
        }
    }
}
```

## 🚀 Setup Instructions

### 1. Prerequisites
- **Xcode**: 14.0 or later  
- **iOS Target**: 14.0 or later (updated from 17.0)
- **macOS**: With Xcode installed
- **Backend Service**: Running BeepMyPhone .NET backend

### 2. Open in Xcode
```bash
cd mobile/iOS/BeepMyPhone
open BeepMyPhone.xcodeproj
```

### 3. iOS App Configuration
1. **Open Settings**: Tap gear icon in main app
2. **Enter Server URL**: Format `192.168.1.100:5001` (your PC's IP)
3. **Set Device Name**: Choose friendly name (e.g., "John's iPhone")
4. **Tap Reconnect**: Establish connection to PC
5. **Grant Permissions**: Allow notifications when prompted

### 4. Build and Run
1. Select your target device (iPhone/Simulator)
2. Click "Build and Run" (⌘+R)
3. Configure server settings in app
4. Grant notification permissions when prompted

### 5. Testing Connection
1. **Backend Health**: Safari → `http://{pc-ip}:5001/health`
2. **App Connection**: Should show green "Connected" status
3. **Test Notification**: Use desktop app or API to send test
4. **iOS Notification**: Should appear as native iOS notification

## 🔧 Configuration

### Server Setup
1. **Find PC IP Address**: Get your Windows PC's local IP address
2. **Backend Port**: Default is `5001` (configurable in backend)
3. **Network Access**: Ensure firewall allows connections on port 5001

### Example Configuration
```
Server URL: 192.168.1.100:5001
Device Name: My iPhone
Connection: Connected ✅
Device ID: ABC123-DEF456-GHI789
```

## 📱 User Interface

### Main Screen (ContentView)
- **Connection Status**: Green/red indicator with connection state
- **Device Info**: Shows configured device name when connected
- **Notification List**: Recent notifications from Windows PC
- **Settings Button**: Access to server configuration

### Settings Screen (SettingsView)
- **Server URL**: Configure Windows PC IP address and port
- **Device Name**: Set friendly name for this device
- **Connection Controls**: Manual reconnect button
- **Status Information**: Connection state and device ID
- **App Information**: Version and about details

### Connection Status Indicators
```swift
// Visual connection feedback
Circle()
    .fill(signalRService.isConnected ? Color.green : Color.red)
    .frame(width: 12, height: 12)

Text(signalRService.isConnected ? "Connected" : "Disconnected")
    .foregroundColor(signalRService.isConnected ? .green : .red)
```

## 🔔 Notification System

### iOS Notification Categories
The app supports different notification categories for better organization:

```swift
// NotificationService.swift - Category-based notifications
switch category.lowercased() {
case "weather":
    content.categoryIdentifier = "WEATHER_CATEGORY"
case "communication":
    content.categoryIdentifier = "COMMUNICATION_CATEGORY"
case "news":
    content.categoryIdentifier = "NEWS_CATEGORY"
default:
    content.categoryIdentifier = "GENERAL_CATEGORY"
}
```

### Notification Features
- **Native iOS Integration**: Uses `UNUserNotificationCenter` for system notifications
- **Banner Display**: Shows notification banners when app backgrounded
- **Sound & Badge**: Configurable notification sounds and app badge count
- **Category Support**: Weather 🌤️, News 📰, Communication 💬, System ⚙️
- **Priority Levels**: High/Medium/Normal with color coding

### Notification Permissions
```swift
// Request notification permissions on first launch
func requestNotificationPermission() {
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
        DispatchQueue.main.async {
            self.hasNotificationPermission = granted
            if granted {
                self.setupNotificationCategories()
            }
        }
    }
}
```

## App Permissions

### Required
- **Local Network** - Connect to PC on same network
- **Notifications** - Display notification banners and alerts

### Info.plist Configuration
- `NSLocalNetworkUsageDescription` - Explains local network usage
- `NSAppTransportSecurity` - Allows HTTP connections to local server
- `UIBackgroundModes` - Enables background notification processing

## Development Notes

### No SignalR Library Dependency
- Uses native WebSocket implementation
- Basic SignalR protocol parsing
- For production, consider using official SignalR Swift client

### Local Development
- No Apple Developer account needed for device testing
- Install directly via Xcode to your personal device
- Notifications work without App Store deployment

### Network Configuration
- App supports both WiFi and cellular connections
- Local network discovery for PC connection
- Configurable server URL in settings

## File Structure

```
BeepMyPhone/
├── BeepMyPhone.xcodeproj/
├── BeepMyPhone/
│   ├── BeepMyPhoneApp.swift      # App entry point
│   ├── ContentView.swift         # Main UI
│   ├── Info.plist               # App configuration
│   ├── Assets.xcassets/         # App icons, colors
│   └── Services/
│       ├── SignalRService.swift  # Backend connection
│       └── NotificationService.swift # Local notifications
└── README.md
```

## 🧪 Testing & Debugging

### Connection Testing
1. **Backend Health Check**: Safari → `http://{pc-ip}:5001/health`
2. **SignalR Negotiation**: Should return connection ID
3. **Device Registration**: Check backend logs for device registration
4. **Test Notification**: Use backend API or desktop app

### Debug Logging
The app provides console logging for debugging:
```swift
print("✅ SignalR negotiated, connectionId: \(connectionId)")
print("✅ Device registered: \(deviceName) (\(deviceId))")
print("📨 Received message: \(message)")
print("❌ WebSocket error: \(error)")
```

## 🐛 Troubleshooting

### Common Issues & Solutions

#### "Cannot Connect to Server"
- **Check IP address**: Verify PC IP in settings
- **Check network**: Ensure same WiFi network
- **Check backend**: Verify Windows service is running
- **Check firewall**: Allow port 5001 in Windows Firewall

#### "No Notifications Received"
- **Check permissions**: Ensure notification access granted
- **Check backend logs**: Verify device registration successful
- **Test notification**: Use desktop app test feature
- **Check connection**: Verify green connection indicator

#### "App Disconnects in Background"
- **Background App Refresh**: Enable in iOS Settings
- **Low Power Mode**: Disable or add app to exceptions
- **Network changes**: App auto-reconnects on network change

### Network Troubleshooting
```bash
# Test connectivity from iOS device
# Use network utility app to ping PC IP address
ping 192.168.1.100

# Test backend accessibility  
# Open Safari on iOS: http://192.168.1.100:5001/health
```

### Build Issues
1. **Xcode Compatibility**: Ensure Xcode 14.0+ for iOS 14.0 target
2. **Deployment Target**: Verify iOS 14.0+ selected (updated from 17.0)
3. **Bundle Identifier**: Ensure unique bundle ID
4. **Clean Build**: Use ⌘+Shift+K if needed

## 🚀 Development

### Project Structure
```
BeepMyPhone.xcodeproj/
BeepMyPhone/
├── BeepMyPhoneApp.swift          # App entry point
├── ContentView.swift             # Main UI with sub-views
├── Info.plist                    # App configuration
└── Services/
    ├── SignalRService.swift      # SignalR connection management
    └── NotificationService.swift # iOS notification handling
```

### Key Dependencies
- **Foundation**: Core iOS framework
- **SwiftUI**: Modern UI framework
- **UserNotifications**: iOS notification system
- **Combine**: Reactive programming
- **BackgroundTasks**: Background operation support

### Code Architecture
```swift
// MVVM Pattern with ObservableObject
class SignalRService: ObservableObject {
    @Published var isConnected = false
    @Published var connectionStatus = "Disconnected"
    @Published var deviceName = UIDevice.current.name
}

// SwiftUI View with EnvironmentObject
struct ContentView: View {
    @EnvironmentObject var signalRService: SignalRService
    @EnvironmentObject var notificationService: NotificationService
}
```

### Build Instructions
```bash
# 1. Clone repository
git clone https://github.com/ChrisColeTech/BeepMyPhone.git
cd BeepMyPhone/mobile/iOS

# 2. Open in Xcode
open BeepMyPhone/BeepMyPhone.xcodeproj

# 3. Configure signing
# - Select project in Xcode
# - Choose your Apple Developer account
# - Set bundle identifier

# 4. Build and run
# - Select target device or simulator
# - Press Cmd+R to build and run
```

## 🔒 Privacy & Security

### Local Network Only
- **No Cloud Dependencies**: All communication stays on local network
- **Direct PC-to-Phone**: No data passes through external servers
- **Network Isolation**: Only devices on same network can connect

### Data Handling
- **Temporary Storage**: Notifications stored temporarily on device
- **No Persistent Logs**: Sensitive notification content not permanently logged
- **Device Registration**: Only device ID and name stored on backend

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/ios-improvement`
3. **Make changes**: Follow Swift coding conventions
4. **Test thoroughly**: Test on multiple iOS versions
5. **Submit pull request**: Include description of changes

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ChrisColeTech/BeepMyPhone/issues)
- **iOS Specific**: Label issues with `ios` tag
- **Documentation**: [Main README](../../README.md)

---

**Built with Swift & SwiftUI for seamless Windows-to-iOS notifications** 📱✨