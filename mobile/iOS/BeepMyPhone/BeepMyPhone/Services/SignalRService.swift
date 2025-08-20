import Foundation
import Combine
import UIKit
import BackgroundTasks

// Data models matching our backend
struct WindowsNotification: Identifiable, Codable {
    let id = UUID()
    let original: OriginalNotification
    let formatted: FormattedNotification
    
    var timestamp: Date {
        return ISO8601DateFormatter().date(from: original.timestamp) ?? Date()
    }
}

struct OriginalNotification: Codable {
    let id: String
    let appName: String
    let title: String
    let message: String
    let timestamp: String
    let rawPayload: String
    let notificationType: Int
}

struct FormattedNotification: Codable {
    let id: String
    let displayTitle: String
    let displayMessage: String
    let appDisplayName: String
    let originalAppName: String
    let category: String
    let priority: String
    let timestamp: String
    let notificationType: Int
    let actionUrl: String?
    let icon: String
    let shortSummary: String
}

class SignalRService: ObservableObject {
    @Published var isConnected = false
    @Published var connectionStatus = "Disconnected"
    
    private var serverURL: String = ""
    private var webSocketTask: URLSessionWebSocketTask?
    private var urlSession: URLSession?
    
    // Device information
    let deviceId = UIDevice.current.identifierForVendor?.uuidString ?? UUID().uuidString
    @Published var deviceName = UIDevice.current.name
    private let deviceType = "iOS"
    
    private var notificationCallback: ((WindowsNotification) -> Void)?
    
    // Background execution management
    private var backgroundTask: UIBackgroundTaskIdentifier = .invalid
    private var backgroundFetchTimer: Timer?
    
    init() {
        setupURLSession()
        setupBackgroundHandling()
        loadSavedSettings()
    }
    
    private func loadSavedSettings() {
        if let savedURL = UserDefaults.standard.string(forKey: "serverURL"), !savedURL.isEmpty {
            self.serverURL = savedURL
            print("✅ Loaded saved server URL: \(savedURL)")
            
            // Auto-connect if we have saved settings
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                self.connectWebSocket()
            }
        }
        
        if let savedName = UserDefaults.standard.string(forKey: "deviceName"), !savedName.isEmpty {
            self.deviceName = savedName
        }
    }
    
    private func saveSettings() {
        UserDefaults.standard.set(serverURL, forKey: "serverURL")
        UserDefaults.standard.set(deviceName, forKey: "deviceName")
        print("✅ Settings saved")
    }
    
    private func setupURLSession() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        urlSession = URLSession(configuration: config)
    }
    
    func connect(onNotificationReceived: @escaping (WindowsNotification) -> Void) {
        self.notificationCallback = onNotificationReceived
        connectWebSocket()
    }
    
    func reconnectManually() {
        guard !serverURL.isEmpty else {
            print("❌ Cannot connect: Server URL not configured")
            updateConnectionStatus(connected: false)
            return
        }
        connectWebSocket()
    }
    
    private func connectWebSocket() {
        guard let urlSession = urlSession else { return }
        guard !serverURL.isEmpty else {
            print("❌ Server URL not configured")
            updateConnectionStatus(connected: false)
            return
        }
        
        // Step 1: Negotiate with SignalR hub
        negotiateSignalRConnection { [weak self] connectionId in
            guard let self = self, let connectionId = connectionId else {
                print("❌ SignalR negotiation failed")
                self?.updateConnectionStatus(connected: false)
                return
            }
            
            print("✅ SignalR negotiated, connectionId: \(connectionId)")
            
            // Step 2: Connect WebSocket with connection ID
            // Auto-detect protocol based on server URL
            let protocol = self.serverURL.contains("ngrok") || self.serverURL.contains("https") ? "wss" : "ws"
            let wsURL = URL(string: "\(protocol)://\(self.serverURL)/notificationHub?id=\(connectionId)")!
            
            self.webSocketTask = urlSession.webSocketTask(with: wsURL)
            self.webSocketTask?.resume()
            
            // Start listening for messages
            self.receiveMessage()
            
            // Register device after connection
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                self.registerDevice()
            }
            
            self.updateConnectionStatus(connected: true)
        }
    }
    
    private func negotiateSignalRConnection(completion: @escaping (String?) -> Void) {
        // Auto-detect HTTP/HTTPS protocol
        let httpProtocol = serverURL.contains("ngrok") || serverURL.contains("https") ? "https" : "http"
        guard let url = URL(string: "\(httpProtocol)://\(serverURL)/notificationHub/negotiate") else {
            completion(nil)
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("❌ Negotiation error: \(error)")
                completion(nil)
                return
            }
            
            guard let data = data else {
                print("❌ No negotiation data received")
                completion(nil)
                return
            }
            
            do {
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let connectionId = json["connectionId"] as? String {
                    completion(connectionId)
                } else {
                    print("❌ Invalid negotiation response")
                    completion(nil)
                }
            } catch {
                print("❌ Failed to parse negotiation response: \(error)")
                completion(nil)
            }
        }.resume()
    }
    
    private func receiveMessage() {
        webSocketTask?.receive { [weak self] result in
            switch result {
            case .success(let message):
                self?.handleMessage(message)
                // Continue listening
                self?.receiveMessage()
                
            case .failure(let error):
                print("❌ WebSocket receive error: \(error)")
                self?.updateConnectionStatus(connected: false)
                
                // Attempt reconnection after delay
                DispatchQueue.main.asyncAfter(deadline: .now() + 5.0) {
                    self?.reconnect()
                }
            }
        }
    }
    
    private func handleMessage(_ message: URLSessionWebSocketTask.Message) {
        switch message {
        case .string(let text):
            parseSignalRMessage(text)
        case .data(let data):
            if let text = String(data: data, encoding: .utf8) {
                parseSignalRMessage(text)
            }
        @unknown default:
            break
        }
    }
    
    private func parseSignalRMessage(_ message: String) {
        // Basic SignalR message parsing (simplified)
        // In production, you'd use a proper SignalR client library
        
        if message.contains("NotificationReceived") {
            // Extract JSON from SignalR message
            if let jsonStart = message.range(of: "{"),
               let jsonEnd = message.range(of: "}", options: .backwards) {
                let jsonString = String(message[jsonStart.lowerBound...jsonEnd.upperBound])
                
                if let data = jsonString.data(using: .utf8) {
                    do {
                        let notification = try JSONDecoder().decode(WindowsNotification.self, from: data)
                        
                        DispatchQueue.main.async {
                            self.notificationCallback?(notification)
                        }
                    } catch {
                        print("❌ Failed to parse notification: \(error)")
                    }
                }
            }
        }
    }
    
    private func registerDevice() {
        let registerMessage = """
        {
            "protocol": "json",
            "version": 1
        }\u{1E}
        {
            "type": 1,
            "target": "RegisterDevice",
            "arguments": ["\(deviceId)", "\(deviceName)", "\(deviceType)"]
        }\u{1E}
        """
        
        webSocketTask?.send(.string(registerMessage)) { error in
            if let error = error {
                print("❌ Failed to register device: \(error)")
            } else {
                print("✅ Device registered: \(self.deviceName) (\(self.deviceId))")
            }
        }
    }
    
    private func updateConnectionStatus(connected: Bool) {
        DispatchQueue.main.async {
            self.isConnected = connected
            self.connectionStatus = connected ? "Connected" : "Disconnected"
        }
    }
    
    func updateConnectionSettings(serverURL: String, deviceName: String) {
        self.serverURL = serverURL
        self.deviceName = deviceName
        saveSettings()
        
        disconnect()
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.connectWebSocket()
        }
    }
    
    private func reconnect() {
        disconnect()
        connectWebSocket()
    }
    
    func disconnect() {
        webSocketTask?.cancel(with: .goingAway, reason: nil)
        webSocketTask = nil
        updateConnectionStatus(connected: false)
    }
    
    // MARK: - Background Execution Management
    
    private func setupBackgroundHandling() {
        // Register for app lifecycle notifications
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appDidEnterBackground),
            name: UIApplication.didEnterBackgroundNotification,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appWillEnterForeground),
            name: UIApplication.willEnterForegroundNotification,
            object: nil
        )
    }
    
    @objc private func appDidEnterBackground() {
        print("📱 App entering background - Starting background task")
        startBackgroundTask()
        startBackgroundFetch()
    }
    
    @objc private func appWillEnterForeground() {
        print("📱 App entering foreground - Ending background task")
        endBackgroundTask()
        stopBackgroundFetch()
        
        // Ensure connection is still active
        if !isConnected {
            reconnect()
        }
    }
    
    private func startBackgroundTask() {
        endBackgroundTask() // End any existing task
        
        backgroundTask = UIApplication.shared.beginBackgroundTask(withName: "BeepMyPhone-Connection") {
            print("⏰ Background task expiring - ending gracefully")
            self.endBackgroundTask()
        }
        
        print("🚀 Background task started: \(backgroundTask.rawValue)")
    }
    
    private func endBackgroundTask() {
        if backgroundTask != .invalid {
            print("🛑 Ending background task: \(backgroundTask.rawValue)")
            UIApplication.shared.endBackgroundTask(backgroundTask)
            backgroundTask = .invalid
        }
    }
    
    private func startBackgroundFetch() {
        // Schedule periodic connection health checks
        backgroundFetchTimer = Timer.scheduledTimer(withTimeInterval: 30.0, repeats: true) { _ in
            self.performBackgroundFetch()
        }
    }
    
    private func stopBackgroundFetch() {
        backgroundFetchTimer?.invalidate()
        backgroundFetchTimer = nil
    }
    
    private func performBackgroundFetch() {
        print("🔄 Performing background fetch - checking connection health")
        
        // Send ping to keep connection alive
        if let webSocketTask = webSocketTask {
            let recordSeparator = String(UnicodeScalar(0x1E)!)
            let pingMessage = "{\"type\": 6}" + recordSeparator
            
            webSocketTask.send(.string(pingMessage)) { error in
                if let error = error {
                    print("❌ Background ping failed: \(error)")
                    DispatchQueue.main.async {
                        self.reconnect()
                    }
                } else {
                    print("✅ Background ping successful")
                }
            }
        }
        
        // Also poll for any missed notifications
        pollForMissedNotifications()
    }
    
    private func pollForMissedNotifications() {
        // Auto-detect HTTP/HTTPS protocol for polling
        let httpProtocol = serverURL.contains("ngrok") || serverURL.contains("https") ? "https" : "http"
        let url = URL(string: "\(httpProtocol)://\(serverURL)/api/notifications/recent?count=5")!
        
        URLSession.shared.dataTask(with: url) { data, response, error in
            if let data = data {
                print("🔄 Polled for missed notifications")
            }
        }.resume()
    }
    
    func registerAsExternalAccessory() {
        print("🔌 Registering PC as external network accessory")
        print("📡 PC (\(serverURL)) provides regular notification data stream")
        print("⚡ External accessory mode enables persistent background communication")
    }
    
    deinit {
        endBackgroundTask()
        stopBackgroundFetch()
        NotificationCenter.default.removeObserver(self)
        disconnect()
    }
}