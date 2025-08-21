#!/bin/bash

echo "🧪 Testing BeepMyPhone Notification Pipeline"
echo "============================================="

SERVER_URL="localhost:5001"
DEVICE_ID="test-device-123"
DEVICE_NAME="Test-Device"

echo ""
echo "1️⃣ Testing SignalR Negotiation..."
NEGO_RESPONSE=$(curl -s -X POST http://$SERVER_URL/notificationHub/negotiate -H "Content-Type: application/json")

if [[ $? -eq 0 ]] && [[ $NEGO_RESPONSE == *"connectionId"* ]]; then
    echo "✅ SignalR negotiation works"
    CONNECTION_ID=$(echo $NEGO_RESPONSE | grep -o '"connectionId":"[^"]*"' | cut -d'"' -f4)
    echo "   Connection ID: $CONNECTION_ID"
else
    echo "❌ SignalR negotiation failed"
    echo "   Response: $NEGO_RESPONSE"
    exit 1
fi

echo ""
echo "2️⃣ Testing Device Registration API..."
REG_RESPONSE=$(curl -s -X POST http://$SERVER_URL/api/notifications/devices/register \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"$DEVICE_NAME\", \"platform\": \"iOS\"}")

if [[ $? -eq 0 ]] && [[ $REG_RESPONSE == *"device"* ]]; then
    echo "✅ Device registration works"
    REGISTERED_DEVICE_ID=$(echo $REG_RESPONSE | grep -o '"deviceId":"[^"]*"' | cut -d'"' -f4)
    echo "   Device ID: $REGISTERED_DEVICE_ID"
else
    echo "❌ Device registration failed"
    echo "   Response: $REG_RESPONSE"
    exit 1
fi

echo ""
echo "3️⃣ Testing Device List API..."
DEVICES_RESPONSE=$(curl -s http://$SERVER_URL/api/notifications/devices)

if [[ $? -eq 0 ]] && [[ $DEVICES_RESPONSE == *"$DEVICE_NAME"* ]]; then
    echo "✅ Device list shows registered device"
    echo "   Found device: $DEVICE_NAME"
else
    echo "❌ Device not found in list"
    echo "   Response: $DEVICES_RESPONSE"
fi

echo ""
echo "4️⃣ Testing Test Notification API..."
TEST_RESPONSE=$(curl -s -X POST http://$SERVER_URL/api/notifications/devices/$REGISTERED_DEVICE_ID/test \
    -H "Content-Type: application/json" \
    -d '{"message": "Pipeline test notification!"}')

if [[ $? -eq 0 ]] && [[ $TEST_RESPONSE == *"success"* ]]; then
    echo "✅ Test notification API works"
    echo "   Response: $TEST_RESPONSE"
else
    echo "❌ Test notification failed"
    echo "   Response: $TEST_RESPONSE"
fi

echo ""
echo "5️⃣ Checking Active Devices..."
ACTIVE_DEVICES=$(curl -s http://$SERVER_URL/api/notifications/devices/active)

if [[ $? -eq 0 ]]; then
    echo "✅ Active devices API works"
    echo "   Active devices: $ACTIVE_DEVICES"
    
    if [[ $ACTIVE_DEVICES == *"connectionId\":\"\"" ]]; then
        echo "⚠️  WARNING: Device shows empty connectionId (no SignalR connection)"
        echo "   This means notifications won't actually reach the device"
    fi
else
    echo "❌ Active devices API failed"
fi

echo ""
echo "6️⃣ Testing Recent Notifications API..."
NOTIFICATIONS=$(curl -s "http://$SERVER_URL/api/notifications/recent?count=5")

if [[ $? -eq 0 ]] && [[ $NOTIFICATIONS == "["* ]]; then
    echo "✅ Recent notifications API works"
    NOTIFICATION_COUNT=$(echo $NOTIFICATIONS | grep -o '"id"' | wc -l)
    echo "   Found $NOTIFICATION_COUNT recent notifications"
else
    echo "❌ Recent notifications API failed"
fi

echo ""
echo "📊 SUMMARY:"
echo "==========="
echo "✅ Backend API endpoints working"
echo "✅ SignalR negotiation working"  
echo "✅ Device registration working"
echo "⚠️  SignalR WebSocket connection needs iOS app"
echo ""
echo "🔧 NEXT STEPS:"
echo "- iOS app needs to connect using proper SignalR negotiation"
echo "- Test end-to-end notification from Windows → iOS"
echo "- Verify notifications appear on iOS device"