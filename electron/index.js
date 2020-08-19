const { app, BrowserWindow } = require('electron');
const { ipcMain } = require('electron');

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  win.loadFile('www/index.html');
  win.on('focus', () => win.flashFrame(false));
  win.removeMenu();
  ipcMain.on('news', async (evt, data) => {
    if(!win.isFocused()) {
      win.flashFrame(true)
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
