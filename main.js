// main.js - this file only opens the app window

const { app, BrowserWindow } = require("electron");

function createWindow() {
    const win = new BrowserWindow({
        width: 520,
        height: 720
    });

    win.loadFile("index.html");
}

// When Electron is ready, open the window
app.whenReady().then(createWindow);

// When all windows are closed, quit the app
app.on("window-all-closed", () => {
    app.quit();
});