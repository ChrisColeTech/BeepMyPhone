import SwiftUI

struct ContentView: View {
    @EnvironmentObject var notificationService: NotificationService
    @EnvironmentObject var signalRService: SignalRService
    @State private var showingSettings = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // Connection Status
                ConnectionStatusView()
                
                // Recent Notifications List
                NotificationListView()
                
                Spacer()
            }
            .navigationTitle("BeepMyPhone")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        showingSettings = true
                    }) {
                        Image(systemName: "gear")
                    }
                }
            }
            .sheet(isPresented: $showingSettings) {
                SettingsView()
            }
        }
    }
}

struct ConnectionStatusView: View {
    @EnvironmentObject var signalRService: SignalRService
    
    var body: some View {
        HStack {
            Circle()
                .fill(signalRService.isConnected ? Color.green : Color.red)
                .frame(width: 12, height: 12)
            
            Text(signalRService.isConnected ? "Connected" : "Disconnected")
                .font(.subheadline)
                .foregroundColor(signalRService.isConnected ? .green : .red)
            
            Spacer()
            
            if signalRService.isConnected {
                Text("Device: \(signalRService.deviceName)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
        .background(Color.gray.opacity(0.1))
        .cornerRadius(8)
        .padding(.horizontal)
    }
}

struct NotificationListView: View {
    @EnvironmentObject var notificationService: NotificationService
    
    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                Text("Recent Notifications")
                    .font(.headline)
                Spacer()
                Text("\(notificationService.notifications.count)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(.horizontal)
            
            if notificationService.notifications.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "bell.slash")
                        .font(.system(size: 50))
                        .foregroundColor(.gray)
                    
                    Text("No notifications yet")
                        .font(.title2)
                        .foregroundColor(.secondary)
                    
                    Text("Windows notifications will appear here when your PC is active")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .padding()
            } else {
                List {
                    ForEach(notificationService.notifications) { notification in
                        NotificationRowView(notification: notification)
                    }
                }
                .listStyle(PlainListStyle())
            }
        }
    }
}

struct NotificationRowView: View {
    let notification: WindowsNotification
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(notification.formatted.icon)
                    .font(.title2)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(notification.formatted.displayTitle)
                        .font(.headline)
                        .lineLimit(1)
                    
                    Text(notification.formatted.appDisplayName)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 4) {
                    Text(notification.formatted.priority)
                        .font(.caption2)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(priorityColor(notification.formatted.priority))
                        .foregroundColor(.white)
                        .cornerRadius(4)
                    
                    Text(timeAgo(from: notification.timestamp))
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            
            if !notification.formatted.displayMessage.isEmpty {
                Text(notification.formatted.displayMessage)
                    .font(.body)
                    .lineLimit(3)
                    .padding(.leading, 32)
            }
        }
        .padding(.vertical, 4)
    }
    
    private func priorityColor(_ priority: String) -> Color {
        switch priority.lowercased() {
        case "high":
            return .red
        case "medium":
            return .orange
        default:
            return .blue
        }
    }
    
    private func timeAgo(from date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}

struct SettingsView: View {
    @Environment(\.presentationMode) var presentationMode
    @EnvironmentObject var signalRService: SignalRService
    @State private var serverURL = ""
    @State private var deviceName = UIDevice.current.name
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Connection")) {
                    HStack {
                        Text("Server URL")
                        TextField("192.168.1.100:5001", text: $serverURL)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                    }
                    
                    HStack {
                        Text("Device Name")
                        TextField("iPhone", text: $deviceName)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                    }
                    
                    Button(action: {
                        signalRService.updateConnectionSettings(serverURL: serverURL, deviceName: deviceName)
                    }) {
                        Text("Reconnect")
                            .foregroundColor(.blue)
                    }
                }
                
                Section(header: Text("Status")) {
                    HStack {
                        Text("Connection")
                        Spacer()
                        Text(signalRService.isConnected ? "Connected" : "Disconnected")
                            .foregroundColor(signalRService.isConnected ? .green : .red)
                    }
                    
                    HStack {
                        Text("Device ID")
                        Spacer()
                        Text(signalRService.deviceId)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Section(header: Text("About")) {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.secondary)
                    }
                    
                    HStack {
                        Text("BeepMyPhone")
                        Spacer()
                        Text("Windows to iOS Notifications")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .onAppear {
                // Load current settings from SignalRService
                serverURL = UserDefaults.standard.string(forKey: "serverURL") ?? ""
                deviceName = UserDefaults.standard.string(forKey: "deviceName") ?? UIDevice.current.name
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(NotificationService())
        .environmentObject(SignalRService())
}