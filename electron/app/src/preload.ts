import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Notification methods
  showNotification: (title: string, message: string) => 
    ipcRenderer.invoke('show-notification', title, message),
    
  // App methods  
  minimize: () => ipcRenderer.invoke('minimize-app'),
  close: () => ipcRenderer.invoke('close-app'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  
  // Backend communication
  connectToBackend: (port: number) => 
    ipcRenderer.invoke('connect-backend', port),
    
  // System methods
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // Event listeners
  onNotificationReceived: (callback: (data: any) => void) => 
    ipcRenderer.on('notification-received', (event, data) => callback(data)),
    
  onBackendStatus: (callback: (status: string) => void) =>
    ipcRenderer.on('backend-status-changed', (event, status) => callback(status)),
    
  // Remove listeners
  removeAllListeners: (channel: string) => 
    ipcRenderer.removeAllListeners(channel)
})

// Types for the exposed API
declare global {
  interface Window {
    electronAPI: {
      showNotification: (title: string, message: string) => Promise<void>
      minimize: () => Promise<void>
      close: () => Promise<void>
      getVersion: () => Promise<string>
      connectToBackend: (port: number) => Promise<boolean>
      getSystemInfo: () => Promise<any>
      onNotificationReceived: (callback: (data: any) => void) => void
      onBackendStatus: (callback: (status: string) => void) => void
      removeAllListeners: (channel: string) => void
    }
  }
}