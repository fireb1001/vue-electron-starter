'use strict'

import { app, protocol, BrowserWindow, globalShortcut } from 'electron'
import * as path from 'path'
import { sync_exec } from'./tools'
import { format as formatUrl } from 'url'
import {  createProtocol } from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'

process.once('loaded', _ => console.log('process loaded'));
process.on('exit', _ => console.log('process exit'));

const moment = require('moment');
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
    /*
    window.loadURL(
      formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
      })
    )
    */
    window.loadURL("app://./index.html");
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
app.on('window-all-closed', async() => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    console.log('electron will quit')
    // just move bk logic to here 
    moment.locale('en')
    let isoDay = moment().format('YYYY-MM-DD')
    const bk_dir = 'D:\\00_db';

    // Create directory if not exists
    const fs = require('fs');
    if (!fs.existsSync(bk_dir)){
      await fs.mkdirSync(bk_dir);
    }

    const dbFile = path.resolve(app.getPath('userData'), 'db/shaderlite.db')
    // TODO get dirs programaticly and do in one place
    await sync_exec(`D:\\bin\\mysqldump -u root shaderdb > ${bk_dir}\\shaderbk.sql `)
    await sync_exec(`copy ${dbFile} ${bk_dir}\\shaderlite-${isoDay}.db`)
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
  mainWindow = createMainWindow()
  globalShortcut.register('CmdOrCtrl+1', () => {
    console.log('CmdOrCtrl+1 is pressed')
    mainWindow.webContents.send('shortcut-pressed','CmdOrCtrl+1')
  })
  /*
  globalShortcut.register("CmdOrCtrl+R", () => {
    console.log("CommandOrControl+R is pressed: Shortcut Disabled");

    // mainWindow.webContents.send('close-connection');
    // app.relaunch();
    // app.exit(0);

    // Force app to crash
    process.crash();
  });
  */

  // mainWindow.on('close', async (e)=> {})
})
