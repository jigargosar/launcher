// Modules to control application life and create native browser window
const { app, BrowserWindow, globalShortcut } = require('electron')
const path = require('path')
const log = require('electron-log')
const debug = require('electron-debug')

log.info('Launcher App: Main Required', process.pid)
log.info('app.getPath -> userData: ', app.getPath('userData'))
log.info('app.getName()', app.getName())

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  log.warn('Exiting: Another Instance Already Running!', process.pid)

  app.quit()
} else {
  try {
    require('electron-reloader')(module, { debug: true })
    // eslint-disable-next-line no-empty
  } catch (_) {}

  false && debug()
  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  let mainWindow

  app.on(
    'second-instance',
    (/* event, commandLine, workingDirectory */) => {
      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    },
  )

  // eslint-disable-next-line no-inner-declarations
  function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 600,
      height: 600,
      // frame: false,
      // alwaysOnTop: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
      },
      show: false,
    })
    // setTimeout(() => mainWindow.minimize(), 0)
    setTimeout(() => {
      mainWindow.showInactive()
      mainWindow.minimize()
    }, 0)

    // and load the index.html of the app.
    false && mainWindow.loadFile(path.join(__dirname, 'index.html'))
    mainWindow.loadURL('http://localhost:8080')

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null
    })

    const globalHotKeyAcc = 'Ctrl+Alt+Space'
    globalShortcut.unregister(globalHotKeyAcc)
    // globalShortcut.unregisterAll()
    globalShortcut.register(globalHotKeyAcc, () => {
      // Do stuff when Y and either Command/Control is pressed.
      if (mainWindow) {
        if (mainWindow.isFocused()) {
          mainWindow.minimize()
        } else {
          if (mainWindow.isMinimized()) {
            mainWindow.restore()
          }
          mainWindow.focus()
        }
      }
    })
  }

  app.on('will-quit', () => {
    // Unregister a shortcut.
    // globalShortcut.unregister('CommandOrControl+X')

    // Unregister all shortcuts.
    globalShortcut.unregisterAll()
  })

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow)

  // Quit when all windows are closed.
  app.on('window-all-closed', function() {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
  })

  app.on('activate', function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow()
  })

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.
}
