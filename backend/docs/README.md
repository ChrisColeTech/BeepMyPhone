# BeepMyPhone Backend - PC-to-Phone Notification Forwarding

## 🎯 Project Overview

BeepMyPhone forwards PC notifications directly to your mobile devices without requiring cloud services like Firebase, AWS, or Apple Push Notification Service. The backend captures system notifications from your desktop computer and instantly sends them to your phone via WebSocket connection.

### **Component Purpose**
The backend monitors PC notifications and forwards them to registered mobile devices in real-time.

### **Technology Stack**
- **Node.js 18+ with TypeScript**: Cross-platform runtime with strong typing
- **Express.js**: Simple HTTP API for device management
- **Socket.io**: WebSocket communication for real-time notification delivery
- **SQLite3**: Lightweight database for device registry
- **Platform APIs**: Native integration with Windows, Linux, and macOS notification systems

### **Integration Points**
- **Mobile Applications**: Direct WebSocket communication with Android and iOS apps
- **Desktop System**: Native OS notification API integration

## 📋 Core Features

### **1. PC Notification Monitoring**
- **Windows Support**: UserNotificationListener API (Windows 10+) for toast notification capture
- **Linux Support**: D-Bus interface monitoring for desktop notification capture
- **macOS Support**: Limited notification monitoring using available APIs
- **Real-time Capture**: Immediate detection and forwarding of system notifications

### **2. Mobile Device Communication**
- **Android Support**: Direct WebSocket connections with custom Android app
- **iOS Support**: WebSocket communication compatible with iOS networking
- **Multiple Delivery Methods**: WebSocket primary, HTTP fallback for reliability
- **Cross-platform Protocol**: Unified notification format for both Android and iOS
- **Multiple Devices**: Support for unlimited connected mobile devices simultaneously
- **Connection Management**: Automatic reconnection and connection health monitoring

### **3. Simple Device Management**
- **Device Registration**: Simple pairing process for mobile devices
- **Connection Status**: Track which devices are currently connected
- **Basic Authentication**: Simple token-based device authentication

## 🔧 Functional Requirements

### **Notification Processing**
- **Capture Rate**: Process all system notifications with minimal latency
- **Content Extraction**: Parse notification title, body, app name, and timestamp
- **Real-time Forwarding**: Immediately send captured notifications to connected devices

### **Device Management**
- **Multi-Device Support**: Handle multiple connected mobile devices
- **Device Registration**: Simple pairing process for new devices
- **Connection Management**: Track device connection status

### **Communication**
- **WebSocket Protocol**: Real-time bidirectional communication
- **Reliable Delivery**: Ensure notifications reach connected devices
- **Connection Recovery**: Automatic reconnection for dropped connections

## 🏗️ Technical Requirements

### **Performance**
- **Low Latency**: <500ms end-to-end notification delivery
- **Memory Usage**: <50MB baseline memory consumption
- **CPU Usage**: <2% CPU utilization during normal operation

### **Reliability**
- **Service Availability**: Continuous notification monitoring
- **Connection Stability**: Maintain WebSocket connections
- **Error Recovery**: Handle network interruptions gracefully

### **Compatibility**
- **Operating Systems**: Windows 10+, Ubuntu 18.04+, macOS 10.15+
- **Mobile OS**: Android 8.0+, iOS 14.0+
- **Network**: Works over internet connections (Wi-Fi, cellular, VPN)

## 🛠️ Technology Choices

### **Runtime & Framework**
- **Node.js with TypeScript**: Excellent WebSocket support and cross-platform compatibility
- **Socket.io**: Robust WebSocket implementation with automatic reconnection
- **Express.js**: Lightweight HTTP server for device management API

### **System Integration**
- **Windows**: `@nodert-win10-rs4/windows.ui.notifications` for UserNotificationListener
- **Linux**: `dbus` package for desktop notification monitoring
- **macOS**: Native addons for limited notification access

### **Data Storage**
- **SQLite3**: Simple embedded database for device registry and basic configuration

## 🔌 Integration Requirements

### **PC System Integration**
- **Windows**: UserNotificationListener API integration
- **Linux**: D-Bus notification system integration
- **System Service**: Background service operation

### **Mobile Integration**
- **Android Integration**: Custom Android app with WebSocket client and local notification display
- **iOS Integration**: Custom iOS app with WebSocket support and notification delivery
- **Platform-Specific Features**: 
  - Android: Background service with persistent notification channel
  - iOS: Background app refresh with local notification scheduling
- **Network Communication**: Direct WebSocket connections over internet with HTTP fallback

### **Network Requirements**
- **Firewall**: May require firewall configuration for WebSocket connections
- **Port Access**: Configurable ports for WebSocket server
- **Internet Connection**: Requires internet connectivity for remote mobile access

## 📊 Configuration

### **Environment Variables**
```
BEEPMYPHONE_PORT=3000                    # HTTP server port
BEEPMYPHONE_WEBSOCKET_PORT=3001          # WebSocket server port
BEEPMYPHONE_LOG_LEVEL=info               # Logging level
BEEPMYPHONE_DATA_DIR=./data              # Database storage directory
```

### **Simple Configuration**
- **Device Registry**: SQLite database with registered devices
- **Server Settings**: Port configuration and basic options
- **Logging**: Configurable log levels for debugging

## 🚫 Limitations

### **Platform Limitations**
- **macOS**: Limited notification access due to Apple's security restrictions
- **Windows UAC**: May require elevated privileges for notification monitoring
- **Linux**: Depends on desktop environment D-Bus implementation

### **Network Requirements**
- **Internet Connection**: Required for remote mobile device access
- **Firewall**: May need configuration for WebSocket connections
- **Port Availability**: Requires available ports for WebSocket server

This streamlined backend focuses on the core functionality: capturing PC notifications and forwarding them to mobile devices in real-time, without unnecessary complexity or enterprise features.