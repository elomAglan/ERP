// main.js
const { app, BrowserWindow } = require("electron");
const path = require("path");
const { fork } = require("child_process");

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Ouvre les devtools seulement en dev
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

  const devServerURL = "http://localhost:5173"; // Front Vite en dev

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL(devServerURL).catch((err) => {
      console.error("Impossible de charger le dev server:", err);
    });
  } else {
    // Mode production : charge le build React
    const indexPath = path.join(__dirname, "../frontend/dist/index.html");
    mainWindow.loadFile(indexPath).catch((err) => {
      console.error("Impossible de charger le build React:", err);
    });
  }
}

function startBackend() {
  const serverPath = path.join(__dirname, "../backend/server.js"); // <-- chemin correct
  backendProcess = fork(serverPath);

  backendProcess.on("error", (err) => {
    console.error("Erreur backend:", err);
  });

  backendProcess.on("exit", (code, signal) => {
    console.log(`Backend arrêté (code=${code}, signal=${signal})`);
  });
}

app.whenReady().then(() => {
  startBackend(); // démarre le backend
  createWindow(); // crée la fenêtre Electron
});

app.on("window-all-closed", () => {
  // ferme le backend si Electron est fermé
  if (backendProcess) backendProcess.kill();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
