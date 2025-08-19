import { app, BrowserWindow, Menu, Tray, nativeImage } from 'electron'
import { join } from 'path'
import { spawn, ChildProcess } from 'child_process'

class BeepMyPhoneApp {
  private mainWindow: BrowserWindow | null = null
  private tray: Tray | null = null
  private isQuitting = false
  private backendProcess: ChildProcess | null = null

  constructor() {
    this.initialize()
  }

  private async initialize(): Promise<void> {
    await app.whenReady()
    await this.startBackendServer()
    this.createMainWindow()
    this.createSystemTray()
    this.setupAppEvents()
  }

  private async startBackendServer(): Promise<void> {
    const isDev = process.env.NODE_ENV === 'development'
    
    if (!isDev) {
      // In production, start the bundled backend server
      const backendPath = join(process.resourcesPath, 'backend', 'index.js')
      
      return new Promise((resolve, reject) => {
        this.backendProcess = spawn('node', [backendPath], {
          stdio: 'inherit',
          env: { ...process.env, NODE_ENV: 'production' }
        })

        this.backendProcess.on('error', (error) => {
          console.error('Failed to start backend server:', error)
          reject(error)
        })

        // Give the server time to start
        setTimeout(() => resolve(), 2000)
      })
    }
    
    // In development, backend runs separately via concurrently
  }

  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, 'preload.js')
      },
      icon: this.getAppIcon(),
      show: false
    })

    // Load the React frontend
    const isDev = process.env.NODE_ENV === 'development'
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:5173') // Vite default port
      this.mainWindow.webContents.openDevTools()
    } else {
      // In production, load from bundled resources
      const frontendPath = join(process.resourcesPath, 'frontend', 'index.html')
      this.mainWindow.loadFile(frontendPath)
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show()
    })

    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })

    // Hide to tray instead of closing
    this.mainWindow.on('close', (event) => {
      if (!this.isQuitting) {
        event.preventDefault()
        this.mainWindow?.hide()
      }
    })
  }

  private createSystemTray(): void {
    const trayIcon = this.getAppIcon()
    this.tray = new Tray(trayIcon)
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show BeepMyPhone',
        click: () => this.showMainWindow()
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          this.isQuitting = true
          this.stopBackendServer()
          app.quit()
        }
      }
    ])

    this.tray.setContextMenu(contextMenu)
    this.tray.setToolTip('BeepMyPhone - PC to Phone Notifications')
    
    this.tray.on('click', () => {
      this.showMainWindow()
    })
  }

  private showMainWindow(): void {
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore()
      }
      this.mainWindow.show()
      this.mainWindow.focus()
    }
  }

  private getAppIcon() {
    // TODO: Create proper app icon
    return nativeImage.createEmpty()
  }

  private setupAppEvents(): void {
    app.on('window-all-closed', () => {
      // Keep app running in tray on macOS
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow()
      }
    })

    app.on('before-quit', () => {
      this.isQuitting = true
      this.stopBackendServer()
    })
  }

  private stopBackendServer(): void {
    if (this.backendProcess) {
      this.backendProcess.kill()
      this.backendProcess = null
    }
  }
}

// Start the application
new BeepMyPhoneApp()