# Cross-Network Setup Guide 🌐

> **Connect your iPhone to BeepMyPhone when not on the same WiFi network**

The default BeepMyPhone setup requires both your PC and iPhone to be on the same local network. This guide shows how to connect them across different networks (e.g., iPhone on cellular data).

## 🚀 Quick Setup with ngrok (Recommended)

### **1. Install ngrok**
```bash
# Download from https://ngrok.com/download
# Windows: Extract ngrok.exe to folder in PATH
# Or install via package manager:
winget install ngrok.ngrok
# choco install ngrok
```

### **2. Start BeepMyPhone Backend**
```bash
cd backend/app
dotnet run --urls=http://0.0.0.0:5001
```

### **3. Create Secure Tunnel**
```bash
# In new terminal/command prompt
ngrok http 5001
```

**ngrok will output:**
```
Session Status                online
Account                       your@email.com  
Version                       3.0.0
Region                        United States (us)
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:5001
```

### **4. Configure iOS App**
1. **Open BeepMyPhone iOS app**
2. **Tap Settings** (gear icon)
3. **Server URL**: Enter `abc123.ngrok.io` (from ngrok output, **no https://**)
4. **Device Name**: Set your device name
5. **Tap Reconnect**

### **5. Test Connection**
- **iOS browser**: Visit `https://abc123.ngrok.io/health`
- **Should show**: "Windows Notification Service is running"
- **App status**: Should show green "Connected" indicator

## 🔧 Alternative Solutions

### **Option 1: Router Port Forwarding**
```bash
# Configure router to forward traffic
External Port 5001 → Your PC (192.168.1.100):5001
```

**Steps:**
1. **Find public IP**: Visit `whatismyipaddress.com`
2. **Router admin**: Login to router configuration
3. **Port forwarding**: Forward port 5001 to your PC's local IP
4. **iOS app**: Use your public IP `123.45.67.89:5001`

**⚠️ Security Warning**: Exposes your PC directly to internet

### **Option 2: VPN Connection**
Set up VPN so phone appears on same network:

**WireGuard (Recommended):**
1. **Install WireGuard** on PC and phone
2. **Configure server** on PC or router
3. **Connect phone** to VPN
4. **Use local IP** in iOS app settings

### **Option 3: Cloud Deployment**
Deploy backend to cloud service for permanent access:

**Azure:**
```bash
az webapp create --resource-group BeepMyPhone --plan BasicPlan --name beep-my-phone --runtime "DOTNET|8.0"
```

**AWS/Heroku/DigitalOcean**: Similar deployment options

## 📱 iOS App Updates for External URLs

The iOS app has been updated to automatically detect external URLs:

```swift
// Auto-detects HTTPS/WSS for ngrok and secure URLs
let httpProtocol = serverURL.contains("ngrok") || serverURL.contains("https") ? "https" : "http"
let wsProtocol = serverURL.contains("ngrok") || serverURL.contains("https") ? "wss" : "ws"
```

**Supported URL formats:**
- `192.168.1.100:5001` (local network)
- `abc123.ngrok.io` (ngrok tunnel)
- `your-domain.com:5001` (custom domain)
- `beep-my-phone.herokuapp.com` (cloud hosting)

## 🧪 Testing Cross-Network Connection

### **1. Verify Backend Accessibility**
```bash
# From phone browser (replace with your ngrok URL)
https://abc123.ngrok.io/health

# Should return: "Windows Notification Service is running"
```

### **2. Test SignalR Negotiation**
```bash
# POST request to negotiation endpoint
curl -X POST https://abc123.ngrok.io/notificationHub/negotiate

# Should return: {"connectionId":"...","availableTransports":[...]}
```

### **3. Send Test Notification**
```bash
# Use backend API to send test notification
curl -X POST https://abc123.ngrok.io/api/notifications/devices/{device-id}/test \
  -H "Content-Type: application/json" \
  -d '{"message": "Cross-network test notification!"}'
```

## 🔒 Security Considerations

### **ngrok (Most Secure)**
- ✅ **Encrypted tunnel**: End-to-end HTTPS/WSS encryption
- ✅ **Temporary URLs**: ngrok URLs expire when tunnel closes
- ✅ **No router changes**: No permanent network modifications
- ⚠️ **Rate limits**: Free ngrok has connection limits

### **Port Forwarding (Least Secure)**
- ❌ **Direct exposure**: PC exposed directly to internet
- ❌ **Permanent**: Port remains open until manually closed
- ❌ **Attack surface**: Increases security risk
- ✅ **No third party**: Direct connection, no intermediary

### **VPN (Most Private)**
- ✅ **Private network**: Creates secure private network
- ✅ **No external exposure**: PC not exposed to internet
- ✅ **Encrypted**: All traffic encrypted
- ⚠️ **Setup complexity**: Requires VPN server configuration

## 🚨 Troubleshooting

### **"Cannot connect to ngrok URL"**
1. **Check ngrok status**: Ensure ngrok tunnel is running
2. **Verify URL**: Copy exact URL from ngrok output
3. **Remove protocol**: Don't include `https://` in iOS app
4. **Test in browser**: Verify URL works in phone browser first

### **"WebSocket connection failed"**
1. **iOS app logs**: Check Xcode console for error details
2. **Protocol detection**: Ensure app detects HTTPS→WSS correctly
3. **Firewall**: Verify Windows Firewall allows ngrok connections
4. **ngrok limits**: Free accounts have connection limits

### **"Backend not accessible"**
1. **ngrok running**: Verify `ngrok http 5001` is active
2. **Backend running**: Ensure `dotnet run` is active on PC
3. **Port conflicts**: Check if port 5001 is already in use
4. **Network connectivity**: Test phone's internet connection

## 📖 Additional Resources

- **ngrok Documentation**: https://ngrok.com/docs
- **WireGuard Setup**: https://www.wireguard.com/quickstart/
- **Router Port Forwarding**: Search "{router model} port forwarding guide"
- **Azure App Service**: https://docs.microsoft.com/en-us/azure/app-service/

---

**Now you can receive Windows notifications on your iPhone from anywhere!** 🌍📱✨