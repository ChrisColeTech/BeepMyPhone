import { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain } from 'electron'
import { join } from 'path'
import { spawn, ChildProcess } from 'child_process'
import os from 'os'

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
    await this.createMainWindow()
    this.createSystemTray()
    this.setupAppEvents()
    this.setupIpcHandlers()
  }

  private async startBackendServer(): Promise<void> {
    // Use Function constructor to prevent TypeScript from transforming dynamic import
    const dynamicImport = new Function('specifier', 'return import(specifier)')
    const { default: isDev } = await dynamicImport('electron-is-dev')
    
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

  private async createMainWindow(): Promise<void> {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false,  // Allow loading local resources in dev mode
        allowRunningInsecureContent: true,  // Allow Vite dev server
        experimentalFeatures: true,  // Enable experimental web features including ES modules
        preload: join(__dirname, 'preload.js')
      },
      icon: this.getAppIcon(),
      show: false
    })

    // Load the React frontend
    // Use Function constructor to prevent TypeScript from transforming dynamic import
    const dynamicImport = new Function('specifier', 'return import(specifier)')
    const { default: isDev } = await dynamicImport('electron-is-dev')
    
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('electron-is-dev:', isDev)
    
    if (isDev) {
      // Use environment variable or fallback to localhost
      const devUrl = process.env.VITE_DEV_URL || 'http://localhost:5173'
      console.log('Loading development URL:', devUrl)
      
      try {
        await this.mainWindow.loadURL(devUrl)
        console.log('Successfully loaded:', devUrl)
      } catch (error) {
        console.error('Failed to load development URL:', devUrl, error)
      }
      
      this.mainWindow.webContents.openDevTools({ mode: 'detach' })
    } else {
      console.log('Loading production file')
      // In production, load from bundled resources
      const frontendPath = join(process.resourcesPath, 'frontend', 'index.html')
      this.mainWindow.loadFile(frontendPath)
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show()
    })

    // Console messages are visible in DevTools when opened

    // Log any navigation errors
    this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error(`Failed to load page: ${validatedURL} - Error ${errorCode}: ${errorDescription}`)
    })

    // Log when DOM is ready
    this.mainWindow.webContents.on('dom-ready', () => {
      console.log('DOM ready - executing renderer checks')
      // Check if React root element exists
      this.mainWindow?.webContents.executeJavaScript(`
        console.log('React root element exists:', !!document.getElementById('root'));
        console.log('Window.React exists:', typeof window.React);
        console.log('Document title:', document.title);
        console.log('Body innerHTML length:', document.body.innerHTML.length);
      `)
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

  private setupIpcHandlers(): void {
    // Window controls
    ipcMain.handle('minimize-app', () => {
      this.mainWindow?.minimize()
    })

    ipcMain.handle('maximize-app', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize()
      } else {
        this.mainWindow?.maximize()
      }
    })

    ipcMain.handle('is-maximized', () => {
      return this.mainWindow?.isMaximized() || false
    })

    ipcMain.handle('close-app', () => {
      this.mainWindow?.close()
    })

    // System info
    ipcMain.handle('get-system-info', () => {
      return {
        platform: process.platform,
        arch: process.arch,
        version: os.release(),
        hostname: os.hostname(),
        uptime: os.uptime(),
        memory: {
          total: os.totalmem(),
          free: os.freemem()
        }
      }
    })

    // App version
    ipcMain.handle('get-version', () => {
      return app.getVersion()
    })
  }
}

// Start the application
new BeepMyPhoneApp()