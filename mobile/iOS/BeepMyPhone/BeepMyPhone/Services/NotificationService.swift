import Foundation
import UserNotifications
import Combine

class NotificationService: NSObject, ObservableObject {
    @Published var notifications: [WindowsNotification] = []
    @Published var hasNotificationPermission = false
    
    private let maxNotifications = 50 // Keep latest 50 notifications
    
    override init() {
        super.init()
        checkNotificationPermission()
    }
    
    private func checkNotificationPermission() {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            DispatchQueue.main.async {
                self.hasNotificationPermission = settings.authorizationStatus == .authorized
            }
        }
    }
    
    func addNotification(_ notification: WindowsNotification) {
        DispatchQueue.main.async {
            // Add to beginning of array (newest first)
            self.notifications.insert(notification, at: 0)
            
            // Keep only the latest notifications
            if self.notifications.count > self.maxNotifications {
                self.notifications = Array(self.notifications.prefix(self.maxNotifications))
            }
        }
    }
    
    func showLocalNotification(title: String, message: String, category: String) {
        guard hasNotificationPermission else {
            print("❌ No notification permission")
            return
        }
        
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = message
        content.sound = .default
        
        // Set badge number
        content.badge = NSNumber(value: notifications.count + 1)
        
        // Add category-specific customization
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
        
        // Create trigger (immediate)
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 0.1, repeats: false)
        
        // Create request
        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: trigger
        )
        
        // Schedule notification
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("❌ Failed to show notification: \(error)")
            } else {
                print("✅ Notification shown: \(title)")
            }
        }
    }
    
    func clearAllNotifications() {
        DispatchQueue.main.async {
            self.notifications.removeAll()
        }
        
        // Clear pending and delivered notifications
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
        UNUserNotificationCenter.current().removeAllDeliveredNotifications()
        
        // Reset badge
        DispatchQueue.main.async {
            UIApplication.shared.applicationIconBadgeNumber = 0
        }
    }
    
    func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            DispatchQueue.main.async {
                self.hasNotificationPermission = granted
                
                if let error = error {
                    print("❌ Notification permission error: \(error)")
                } else if granted {
                    print("✅ Notification permission granted")
                    self.setupNotificationCategories()
                } else {
                    print("❌ Notification permission denied")
                }
            }
        }
    }
    
    private func setupNotificationCategories() {
        let weatherCategory = UNNotificationCategory(
            identifier: "WEATHER_CATEGORY",
            actions: [],
            intentIdentifiers: [],
            options: []
        )
        
        let communicationCategory = UNNotificationCategory(
            identifier: "COMMUNICATION_CATEGORY",
            actions: [],
            intentIdentifiers: [],
            options: [.allowInCarPlay]
        )
        
        let newsCategory = UNNotificationCategory(
            identifier: "NEWS_CATEGORY",
            actions: [],
            intentIdentifiers: [],
            options: []
        )
        
        let generalCategory = UNNotificationCategory(
            identifier: "GENERAL_CATEGORY",
            actions: [],
            intentIdentifiers: [],
            options: []
        )
        
        UNUserNotificationCenter.current().setNotificationCategories([
            weatherCategory,
            communicationCategory,
            newsCategory,
            generalCategory
        ])
    }
}

// MARK: - UNUserNotificationCenterDelegate
extension NotificationService: UNUserNotificationCenterDelegate {
    
    // Handle notification when app is in foreground
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        // Show notification even when app is in foreground
        completionHandler([.banner, .sound, .badge])
    }
    
    // Handle notification tap
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let userInfo = response.notification.request.content.userInfo
        
        // Handle notification tap - could navigate to specific screen
        print("📱 Notification tapped: \(userInfo)")
        
        completionHandler()
    }
    
    // Handle notification settings change
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        openSettingsFor notification: UNNotification?
    ) {
        // User tapped "Settings" in notification - open app settings
        if let settingsUrl = URL(string: UIApplication.openSettingsURLString) {
            DispatchQueue.main.async {
                UIApplication.shared.open(settingsUrl)
            }
        }
    }
}