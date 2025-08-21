import SwiftUI
import UserNotifications

@main
struct BeepMyPhoneApp: App {
    @StateObject private var notificationService = NotificationService()
    @StateObject private var signalRService = SignalRService()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(notificationService)
                .environmentObject(signalRService)
                .onAppear {
                    setupNotifications()
                    connectToService()
                }
        }
    }
    
    private func setupNotifications() {
        // Request notification permission
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            DispatchQueue.main.async {
                if granted {
                    print("✅ Notification permission granted")
                } else {
                    print("❌ Notification permission denied")
                }
                
                if let error = error {
                    print("Error requesting notification permission: \(error)")
                }
            }
        }
        
        // Set notification delegate
        UNUserNotificationCenter.current().delegate = notificationService
    }
    
    private func connectToService() {
        // Register external accessory capability
        signalRService.registerAsExternalAccessory()
        
        // Connect to SignalR service with background support
        signalRService.connect { notification in
            // Show local notification when SignalR message received
            notificationService.showLocalNotification(
                title: notification.formatted.displayTitle,
                message: notification.formatted.displayMessage,
                category: notification.formatted.category
            )
        }
    }
}