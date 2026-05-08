import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Vite dev server (see `npm run dev`). */
const DEV_SERVER_URL = 'http://localhost:5173'
const DEV_LOAD_RETRIES = 60
const DEV_LOAD_INTERVAL_MS = 250

function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  void loadRenderer(mainWindow)

  return mainWindow
}

async function loadRenderer(mainWindow: BrowserWindow): Promise<void> {
  if (!app.isPackaged) {
    // MN 260508 Retry so Electron can start before the Vite dev server is listening.
    for (let attempt = 0; attempt < DEV_LOAD_RETRIES; attempt++) {
      try {
        await mainWindow.loadURL(DEV_SERVER_URL)
        return
      } catch {
        await new Promise((resolve) => setTimeout(resolve, DEV_LOAD_INTERVAL_MS))
      }
    }
    await mainWindow.loadURL(DEV_SERVER_URL)
    return
  }

  const indexHtml = path.join(__dirname, '..', 'dist', 'index.html')
  await mainWindow.loadFile(indexHtml)
}

app.whenReady().then(() => {
  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
