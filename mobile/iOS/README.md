# BeepMyPhone iOS App

A SwiftUI iOS app that receives Windows notifications from your PC via SignalR and displays them as local iOS notifications.

## Features

- **Real-time notifications** from Windows PC via SignalR WebSocket connection
- **Local iOS notifications** with sound, badge, and banner display
- **Formatted notification display** with categories, priorities, and icons
- **Device registration** with the backend service
- **Connection management** with automatic reconnection
- **Settings screen** for server configuration
- **No Apple Developer account required** for local development

## Architecture

### Components

1. **BeepMyPhoneApp.swift** - Main SwiftUI app entry point
2. **ContentView.swift** - Main UI with notification list and status
3. **SignalRService.swift** - WebSocket connection to backend
4. **NotificationService.swift** - Local iOS notification management

### Flow

```
Windows PC → .NET Service → SignalR Hub → iOS App → Local Notification
```

## Setup Instructions

### 1. Prerequisites
- Xcode 15.0 or later
- iOS 17.0 or later (target device)
- macOS with Xcode installed
- Running BeepMyPhone backend service

### 2. Open in Xcode
```bash
cd mobile/iOS/BeepMyPhone
open BeepMyPhone.xcodeproj
```

### 3. Configure Backend Connection
- Update server URL in `SignalRService.swift` if needed
- Default: `192.168.1.100:5001` (example IP address)
- Or configure in app Settings screen

### 4. Build and Run
1. Select your target device (iPhone/Simulator)
2. Click "Build and Run" (⌘+R)
3. Grant notification permissions when prompted

### 5. Testing
1. Ensure backend service is running on PC
2. App should connect automatically and show "Connected" status
3. Generate Windows notifications on PC
4. iOS app should receive and display notifications

## Key Features Explained

### Device Registration
- App automatically registers with backend using device UUID
- Sends device name, type (iOS), and connection ID
- Enables targeted messaging from backend

### Local Notifications
- Uses `UNUserNotificationCenter` for native iOS notifications
- Shows banner, sound, and badge when app is backgrounded
- Displays in app when foreground
- Categories: Weather 🌤️, News 📰, Communication 💬, System ⚙️

### SignalR Connection
- WebSocket connection to `/notificationHub` endpoint
- Handles connection failures with automatic retry
- Parses SignalR protocol messages
- Supports device-specific messaging

### Notification Formatting
- Receives both original and formatted notification data
- Displays formatted titles, messages, and metadata
- Shows priority levels (High/Medium/Normal) with colors
- Includes app icons and timestamps

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

## Troubleshooting

### Connection Issues
1. Check backend service is running on PC
2. Verify IP address in app settings
3. Ensure both devices on same network
4. Check firewall settings on PC

### Notification Issues
1. Grant notification permissions in iOS Settings
2. Check notification settings for the app
3. Verify Do Not Disturb is not enabled
4. Test with app in background

### Build Issues
1. Ensure Xcode version compatibility
2. Check iOS deployment target (17.0+)
3. Verify bundle identifier is unique
4. Clean build folder if needed (⌘+Shift+K)

## Next Steps

### For Production Deployment
1. Get Apple Developer account ($99/year)
2. Configure proper bundle ID and certificates
3. Add official SignalR Swift client library
4. Implement proper error handling and logging
5. Add unit tests and UI tests
6. Submit to App Store

### Potential Enhancements
- Push notifications for better reliability
- Notification history persistence
- Custom notification sounds
- Notification filtering and preferences
- Widget support for notification preview
- Watch app companion