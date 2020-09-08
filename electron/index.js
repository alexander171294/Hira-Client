const { app, BrowserWindow } = require('electron');
const { ipcMain, screen } = require('electron');
const contextMenu = require('electron-context-menu');

contextMenu({
//   prepend: (params, browserWindow) => [
//       {
//         role: "zoomIn"
//       },
//       {
//         role: "zoomOut"
//       },
//   ],
});

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: parseInt(95*screen.getPrimaryDisplay().size.width/100, 10), // 95% of screen
    height: parseInt(90*screen.getPrimaryDisplay().size.height/100, 10), // 90% of screen
    webPreferences: {
      nodeIntegration: true
    },
    icon: __dirname +  '/resources/256x256.png'
  });

  // and load the index.html of the app.
  win.loadFile('www/index.html');
  win.on('focus', () => win.flashFrame(false));
  win.removeMenu();
  // open windows on webbrowser
  win.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });
  ipcMain.on('news', async (evt, data) => {
    if(!win.isFocused()) {
      win.flashFrame(true)
      evt.reply('playSound', {});
    }
  });
}

app.whenReady().then(createWindow);
// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') {
//       app.quit()
//     }
// });

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
});
