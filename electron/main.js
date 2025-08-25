const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // sécurité
      contextIsolation: true,
    }
  });

  // Ouvre la console pour debug
  win.webContents.openDevTools();

  // Vérifie si on est en mode développement
  const devServerURL = "http://localhost:5173"; // Vérifie que Vite tourne sur ce port
  if (process.env.NODE_ENV === "development") {
    win.loadURL(devServerURL).catch(err => {
      console.error("Impossible de charger Vite dev server:", err);
    });
  } else {
    // Mode production : charge le build
    const indexPath = path.join(__dirname, "../frontend/dist/index.html");
    win.loadFile(indexPath).catch(err => {
      console.error("Impossible de charger le build React:", err);
    });
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
