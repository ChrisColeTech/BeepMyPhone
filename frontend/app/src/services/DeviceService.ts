export interface RegisteredDevice {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  lastSeen: string;
  isActive: boolean;
  connectionId?: string;
  notificationPreferences?: {
    allowAll: boolean;
    blockedApps: string[];
    onlyFromApps: string[];
  };
}

export interface DeviceRegistrationRequest {
  name: string;
  platform: 'ios' | 'android';
}

export interface DeviceUpdateRequest {
  name?: string;
  isActive?: boolean;
  notificationPreferences?: {
    allowAll: boolean;
    blockedApps: string[];
    onlyFromApps: string[];
  };
}

export class DeviceService {
  private baseUrl = 'http://localhost:5001/api';

  async getDevices(): Promise<RegisteredDevice[]> {
    const response = await fetch(`${this.baseUrl}/notifications/devices`);
    if (!response.ok) {
      throw new Error(`Failed to fetch devices: ${response.statusText}`);
    }
    return response.json();
  }

  async getDevice(id: string): Promise<RegisteredDevice> {
    const response = await fetch(`${this.baseUrl}/notifications/devices/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch device: ${response.statusText}`);
    }
    return response.json();
  }

  async registerDevice(device: DeviceRegistrationRequest): Promise<{ 
    device: RegisteredDevice; 
    connectionCode: string;
    pairingInstructions: {
      qrCode: string;
      manualCode: string;
      instructions: string;
    }
  }> {
    const response = await fetch(`${this.baseUrl}/notifications/devices/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(device),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to register device: ${response.statusText}`);
    }
    
    return response.json();
  }

  async updateDevice(id: string, updates: DeviceUpdateRequest): Promise<RegisteredDevice> {
    const response = await fetch(`${this.baseUrl}/notifications/devices/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update device: ${response.statusText}`);
    }
    
    return response.json();
  }

  async deleteDevice(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/notifications/devices/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete device: ${response.statusText}`);
    }
  }

  async testNotification(id: string, message: string = 'Test notification from BeepMyPhone'): Promise<void> {
    const response = await fetch(`${this.baseUrl}/notifications/devices/${id}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send test notification: ${response.statusText}`);
    }
  }

  async getDeviceConnectionHistory(id: string): Promise<Array<{ timestamp: string; event: string; details?: string }>> {
    const response = await fetch(`${this.baseUrl}/notifications/devices/${id}/history`);
    if (!response.ok) {
      throw new Error(`Failed to fetch connection history: ${response.statusText}`);
    }
    return response.json();
  }
}

export const deviceService = new DeviceService();