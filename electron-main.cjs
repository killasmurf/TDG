const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 850,
        height: 700,
        title: 'Tower Defense Game',
        resizable: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // Load the game's index.html
    win.loadFile('index.html');

    // Open DevTools for debugging (remove in production)
    win.webContents.openDevTools();

    // Remove menu bar for cleaner game experience
    win.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
