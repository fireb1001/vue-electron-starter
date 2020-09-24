'use strict'

import { app, protocol, BrowserWindow, globalShortcut } from 'electron'
import * as path from 'path'
import { sync_exec } from'./tools'
import { format as formatUrl } from 'url'
import {
  createProtocol,
  //installVueDevtools
} from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

// Standard scheme must be registered before the app is ready
//protocol.registerStandardSchemes(['app'], { secure: true })
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: {  secure: true } }]);

function createMainWindow () {
  const window = new BrowserWindow({ webPreferences: { webSecurity: false , nodeIntegration: true, enableRemoteModule: true}, icon:  'assets/icon.png'  })

  if (isDevelopment) {
    // Load the url of the dev server if in development mode
    window.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) window.webContents.openDevTools()
  } else {
    createProtocol('app')
    //   Load the index.html when not in development
    window.loadURL(
      formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
      })
    )
  }

  window.on('closed', async () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  // Add window.maximize()
  window.maximize()

  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    //await installVueDevtools()
  }
  mainWindow = createMainWindow()
  mainWindow.on('close', async (e)=> {
    //await sync_exec(`copy C:\\Users\\alrhma\\AppData\\Roaming\\shaderlite\\db\\shaderlite.db D:\\zdevhome\\electron\\shaderlite\\db\\shaderlite.db`)
    let moment = require('moment')
    moment.locale('en')
    let isoDay = moment().format('YYYY-MM-DD')
    const path = require('path')
    const dbFile = path.resolve(app.getPath('userData'), 'db/shaderlite.db')
    // TODO get dirs programaticly and do in one place
    let sout = await sync_exec(`copy ${dbFile} D:\\00_db\\shaderlite-${isoDay}.db`)
    console.log(sout.stdout ,dbFile, e)
  })
})

app.on('ready', () => {
  globalShortcut.register('CmdOrCtrl+1', () => {
    console.log('CmdOrCtrl+1 is pressed')
    mainWindow.webContents.send('shortcut_pressed','CmdOrCtrl+1')
  })
})