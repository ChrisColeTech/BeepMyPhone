const WebSocket = require('ws');
// Use dynamic import for node-fetch since it's ESM in newer versions
let fetch;
(async () => {
    try {
        // Try ES Module import first
        const nodeFetch = await import('node-fetch');
        fetch = nodeFetch.default;
    } catch {
        // Fallback to CommonJS
        fetch = require('node-fetch');
    }
})();

const SERVER_URL = 'localhost:5001';
const DEVICE_ID = 'test-device-123';
const DEVICE_NAME = 'Test iOS Device';

async function testSignalRConnection() {
    console.log('🧪 Testing SignalR Connection Pipeline...\n');
    
    try {
        // Step 1: Negotiate SignalR connection
        console.log('1️⃣ Negotiating SignalR connection...');
        const negotiateResponse = await fetch(`http://${SERVER_URL}/notificationHub/negotiate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!negotiateResponse.ok) {
            throw new Error(`Negotiation failed: ${negotiateResponse.status}`);
        }
        
        const negotiateData = await negotiateResponse.json();
        const connectionId = negotiateData.connectionId;
        console.log(`✅ Negotiation successful, connectionId: ${connectionId}\n`);
        
        // Step 2: Connect via WebSocket
        console.log('2️⃣ Connecting to SignalR WebSocket...');
        const ws = new WebSocket(`ws://${SERVER_URL}/notificationHub?id=${connectionId}`);
        
        await new Promise((resolve, reject) => {
            ws.on('open', () => {
                console.log('✅ WebSocket connected\n');
                resolve();
            });
            
            ws.on('error', (error) => {
                console.log(`❌ WebSocket error: ${error}`);
                reject(error);
            });
            
            setTimeout(() => reject(new Error('WebSocket connection timeout')), 5000);
        });
        
        // Step 3: Register device with SignalR hub
        console.log('3️⃣ Registering device with SignalR hub...');
        const registerMessage = {
            "type": 1,
            "target": "RegisterDevice", 
            "arguments": [DEVICE_ID, DEVICE_NAME, "iOS"]
        };
        
        ws.send(JSON.stringify(registerMessage) + String.fromCharCode(0x1E));
        console.log(`✅ Device registration sent: ${DEVICE_NAME} (${DEVICE_ID})\n`);
        
        // Step 4: Listen for notifications
        console.log('4️⃣ Listening for notifications...');
        ws.on('message', (data) => {
            const message = data.toString();
            console.log(`📨 Received message: ${message}`);
            
            if (message.includes('NotificationReceived')) {
                console.log('🎉 SUCCESS: Notification received on iOS device!');
            }
        });
        
        // Step 5: Wait a moment, then send test notification
        setTimeout(async () => {
            console.log('5️⃣ Sending test notification...');
            
            const testResponse = await fetch(`http://${SERVER_URL}/api/notifications/devices/${DEVICE_ID}/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: "Test notification from SignalR pipeline!"
                })
            });
            
            if (testResponse.ok) {
                const result = await testResponse.json();
                console.log(`✅ Test notification sent: ${result.message}`);
            } else {
                console.log(`❌ Test notification failed: ${testResponse.status}`);
            }
        }, 3000);
        
        // Keep connection alive for testing
        setTimeout(() => {
            ws.close();
            console.log('\n🔌 Test completed, connection closed');
        }, 10000);
        
    } catch (error) {
        console.log(`❌ Test failed: ${error.message}`);
    }
}

// Check if running in Node.js environment
if (typeof require !== 'undefined' && require.main === module) {
    testSignalRConnection();
}