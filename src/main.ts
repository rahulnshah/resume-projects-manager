import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { loadProjects, loadNonResumeProjects, saveProjects } from "./database";
import * as fs from "fs/promises";
ipcMain.handle("read-file", async (_, filePath: string) => {
  try {
    const data = await fs.readFile(filePath);
    return data;
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
});
ipcMain.handle("load-projects", () => {
  return loadProjects();
});

// Add this handler near your other ipcMain.handle calls
ipcMain.handle(
  "load-non-resume-projects",
  async (_, resumeProjectNames: string[]) => {
    return loadNonResumeProjects(resumeProjectNames);
  }
);

// Add this handler for the file picker
ipcMain.handle("show-open-file-picker", async (_, options) => {
  const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
    properties: ["openFile"],
    ...options,
  });

  if (result.canceled || result.filePaths.length === 0) {
    throw new Error("No file selected");
  }

  // Return the selected file path(s)
  return result.filePaths;
});

// Add this handler
ipcMain.handle("save-projects", async (_, projects) => {
  return saveProjects(projects);
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
