using System;
using System.IO;
using Microsoft.Data.Sqlite;
using System.Text.Json;

namespace NotificationMonitorPOC
{
    class Program
    {
        private static string notificationDbPath = "";
        private static DateTime lastCheck = DateTime.Now;
        
        static void Main(string[] args)
        {
            Console.WriteLine("🔔 Windows Notification Monitor - Proof of Concept");
            Console.WriteLine("==================================================");
            Console.WriteLine();

            // Step 1: Find the notification database
            if (!FindNotificationDatabase())
            {
                Console.WriteLine("❌ Could not find Windows notification database.");
                Console.WriteLine("Expected location: %LOCALAPPDATA%\\Microsoft\\Windows\\Notifications\\wpndatabase.db");
                Console.ReadLine();
                return;
            }

            Console.WriteLine($"✅ Found notification database: {notificationDbPath}");
            Console.WriteLine();

            // Step 2: Test database connection and read existing notifications
            TestDatabaseConnection();
            Console.WriteLine();

            // Step 3: Set up file monitoring
            SetupFileMonitoring();

            Console.WriteLine("🎯 Monitoring for new notifications...");
            Console.WriteLine("💡 Generate some notifications (Teams, Outlook, browser) to test.");
            Console.WriteLine("Press any key to exit.");
            Console.ReadLine();
        }

        private static bool FindNotificationDatabase()
        {
            // Try Windows path first (if running on Windows)
            var localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            notificationDbPath = Path.Combine(localAppData, "Microsoft", "Windows", "Notifications", "wpndatabase.db");
            
            if (File.Exists(notificationDbPath))
            {
                return true;
            }
            
            // Try WSL path (if running in WSL)
            var wslPaths = new[]
            {
                "/mnt/c/Users/Risky Biz/AppData/Local/Microsoft/Windows/Notifications/wpndatabase.db",
                "/mnt/c/Users/ccole/AppData/Local/Microsoft/Windows/Notifications/wpndatabase.db"
            };
            
            foreach (var path in wslPaths)
            {
                if (File.Exists(path))
                {
                    notificationDbPath = path;
                    return true;
                }
            }
            
            return false;
        }

        private static void TestDatabaseConnection()
        {
            Console.WriteLine("🔍 Testing database connection and reading recent notifications...");
            
            try
            {
                // Copy database to local temp location to avoid WSL/Windows file locking issues
                var tempDbPath = Path.Combine(Path.GetTempPath(), "wpndatabase_copy.db");
                Console.WriteLine($"📋 Copying database to: {tempDbPath}");
                File.Copy(notificationDbPath, tempDbPath, true);
                
                var connectionString = $"Data Source={tempDbPath};Mode=ReadOnly;";
                using var connection = new SqliteConnection(connectionString);
                connection.Open();

                // Get recent notifications
                var sql = @"
                    SELECT 
                        n.Payload,
                        n.ArrivalTime,
                        h.PrimaryId as AppName,
                        n.Type
                    FROM Notification n 
                    LEFT JOIN NotificationHandler h ON n.HandlerID = h.RecordID 
                    ORDER BY n.ArrivalTime DESC 
                    LIMIT 5";

                using var command = new SqliteCommand(sql, connection);
                using var reader = command.ExecuteReader();

                Console.WriteLine("📋 Recent notifications:");
                Console.WriteLine("----------------------");

                var count = 0;
                while (reader.Read() && count < 5)
                {
                    var payload = reader.GetString(0);
                    var arrivalTime = reader.GetInt64(1);
                    var appName = reader.IsDBNull(2) ? "Unknown" : reader.GetString(2);
                    var type = reader.GetInt32(3);

                    // Convert Windows filetime to DateTime
                    var dateTime = DateTime.FromFileTime(arrivalTime);
                    
                    Console.WriteLine($"🕐 {dateTime:yyyy-MM-dd HH:mm:ss}");
                    Console.WriteLine($"📱 App: {appName}");
                    Console.WriteLine($"🔢 Type: {type}");
                    Console.WriteLine($"📝 Payload: {payload.Substring(0, Math.Min(200, payload.Length))}...");
                    Console.WriteLine();

                    count++;
                }

                if (count == 0)
                {
                    Console.WriteLine("ℹ️  No recent notifications found in database.");
                }

                connection.Close();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Database connection failed: {ex.Message}");
            }
        }

        private static void SetupFileMonitoring()
        {
            Console.WriteLine("👀 Setting up file system monitoring...");
            
            try
            {
                var directoryPath = Path.GetDirectoryName(notificationDbPath);
                var watcher = new FileSystemWatcher(directoryPath!);
                
                watcher.Filter = "wpndatabase.db*";  // Include WAL files
                watcher.IncludeSubdirectories = false;
                watcher.NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.Size;
                
                watcher.Changed += OnNotificationDatabaseChanged;
                watcher.Created += OnNotificationDatabaseChanged;
                
                watcher.EnableRaisingEvents = true;
                
                Console.WriteLine("✅ File monitoring started successfully.");
                lastCheck = DateTime.Now;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ File monitoring setup failed: {ex.Message}");
            }
        }

        private static void OnNotificationDatabaseChanged(object sender, FileSystemEventArgs e)
        {
            Console.WriteLine($"🔔 Database changed: {e.Name} at {DateTime.Now:HH:mm:ss}");
            
            // Small delay to let database finish writing
            Thread.Sleep(100);
            
            try
            {
                CheckForNewNotifications();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️  Error checking new notifications: {ex.Message}");
            }
        }

        private static void CheckForNewNotifications()
        {
            var connectionString = $"Data Source={notificationDbPath};Mode=ReadOnly;Cache=Shared;";
            using var connection = new SqliteConnection(connectionString);
            connection.Open();

            // Convert DateTime to Windows filetime for comparison
            var lastCheckFileTime = lastCheck.ToFileTime();

            var sql = @"
                SELECT 
                    n.Payload,
                    n.ArrivalTime,
                    h.PrimaryId as AppName,
                    n.Type
                FROM Notification n 
                LEFT JOIN NotificationHandler h ON n.HandlerID = h.RecordID 
                WHERE n.ArrivalTime > @lastCheck
                ORDER BY n.ArrivalTime DESC";

            using var command = new SqliteCommand(sql, connection);
            command.Parameters.AddWithValue("@lastCheck", lastCheckFileTime);
            
            using var reader = command.ExecuteReader();

            var newNotifications = 0;
            while (reader.Read())
            {
                var payload = reader.GetString(0);
                var arrivalTime = reader.GetInt64(1);
                var appName = reader.IsDBNull(2) ? "Unknown" : reader.GetString(2);
                
                var dateTime = DateTime.FromFileTime(arrivalTime);
                
                Console.WriteLine("🆕 NEW NOTIFICATION DETECTED!");
                Console.WriteLine($"   📱 App: {appName}");
                Console.WriteLine($"   🕐 Time: {dateTime:HH:mm:ss}");
                
                // Try to extract title and message from payload XML
                ExtractNotificationContent(payload);
                Console.WriteLine();
                
                newNotifications++;
            }

            if (newNotifications > 0)
            {
                lastCheck = DateTime.Now;
                Console.WriteLine($"✅ Processed {newNotifications} new notification(s)");
                Console.WriteLine();
            }

            connection.Close();
        }

        private static void ExtractNotificationContent(string payload)
        {
            try
            {
                // Basic XML parsing to extract title and message
                if (payload.Contains("<text"))
                {
                    var lines = payload.Split('\n');
                    var textElements = new List<string>();
                    
                    foreach (var line in lines)
                    {
                        if (line.Contains("<text") && line.Contains(">") && line.Contains("</text>"))
                        {
                            var start = line.IndexOf('>') + 1;
                            var end = line.IndexOf("</text>");
                            if (start < end)
                            {
                                var text = line.Substring(start, end - start).Trim();
                                if (!string.IsNullOrEmpty(text))
                                {
                                    textElements.Add(text);
                                }
                            }
                        }
                    }
                    
                    if (textElements.Count > 0)
                    {
                        Console.WriteLine($"   📋 Title: {textElements[0]}");
                        if (textElements.Count > 1)
                        {
                            Console.WriteLine($"   💬 Message: {textElements[1]}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"   ⚠️  Could not parse notification content: {ex.Message}");
            }
        }
    }
}
