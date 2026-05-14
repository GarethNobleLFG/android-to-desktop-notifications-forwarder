require('dotenv').config();
const { app, BrowserWindow, screen, globalShortcut } = require('electron'); // 1. Added globalShortcut
const path = require('path');

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('--disable-http-cache');

let overlayWindow;
let lastKeyPressTime = 0; // 2. Variable to track double-tap timing

function createOverlay() {
    const { width, height } = screen.getPrimaryDisplay().bounds;

    overlayWindow = new BrowserWindow({
        width: 400,
        height: height, 
        x: width - 400,
        y: 0,
        frame: false,
        alwaysOnTop: true,
        transparent: true,
        backgroundColor: '#00000000',
        resizable: true,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, 
            backgroundThrottling: false // 3. CRITICAL: Prevents React interval from slowing down when window is hidden
        }
    });

    overlayWindow.setIgnoreMouseEvents(true, { forward: true });

    if (process.env.VITE_DEV_SERVER_URL) {
        overlayWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } 
    else {
        overlayWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
    }
    
    overlayWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.log('Overlay failed to load:', errorDescription);
    });
}

app.whenReady().then(() => {
    createOverlay();

    globalShortcut.register('Alt+P', () => {
        const currentTime = new Date().getTime();
        
        // Check if the previous 'Alt+P' press was within the last 500 milliseconds
        if (currentTime - lastKeyPressTime < 500) {
            // Double tap detected! Toggle window visibility
            if (overlayWindow.isVisible()) {
                overlayWindow.hide();
            } 
            else {
                overlayWindow.show();
                overlayWindow.setAlwaysOnTop(true, 'screen-saver'); 
            }
            lastKeyPressTime = 0; 
        } 
        else {
            lastKeyPressTime = currentTime;
        }
    });

    console.log('Push Notification Desktop Overlay is running!');
});

// 5. Clean up the shortcuts when the app closes
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createOverlay();
    }
});