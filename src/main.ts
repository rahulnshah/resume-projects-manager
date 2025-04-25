import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { loadProjects, loadNonResumeProjects } from "./database";
import * as fs from "fs/promises";
// import * as pdfjsLib from "pdfjs-dist";
import { Project } from "./model";
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// ipcMain.handle("parse-pdf", async (_, filePath: string) => {
//   try {
//     // Read the file as a Buffer
//     const fileBuffer = await fs.readFile(filePath);

//     // // Set the worker source for PDF.js
//     // pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

//     // Load the PDF using PDF.js
//     const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
//     let text = "";

//     // Extract text from all pages
//     for (let i = 1; i <= pdf.numPages; i++) {
//       const page = await pdf.getPage(i);
//       const textContent = await page.getTextContent();
//       const pageText = textContent.items.map((item: any) => item.str).join(" ");
//       text += pageText + "\n";
//     }

//     const projectSectionMatch = text.match(/PROJECTS([\s\S]*?)CERTIFICATIONS/i);
//     if (!projectSectionMatch) return [];

//     const section = projectSectionMatch[1].trim();

//     const lines = section
//       .split("\n")
//       .map((line) => line.trim())
//       .filter(Boolean);

//     const projects: Project[] = [];
//     let currentProject: Project | null = null;

//     for (let line of lines) {
//       if (/^https?:\/\/\S+$/i.test(line)) {
//         // This is a URL - ignore or attach later if needed
//         continue;
//       }

//       if (/^[A-Z][A-Za-z0-9\s\-&]+$/.test(line) && !line.startsWith("●")) {
//         // Likely a project title
//         if (currentProject) {
//           projects.push(currentProject);
//         }
//         currentProject = { name: line.trim(), bullets: [] };
//       } else if (line.startsWith("●") && currentProject) {
//         // This is a bullet point
//         currentProject.bullets.push(line.replace(/^●\s*/, "").trim());
//       }
//     }

//     if (currentProject) {
//       projects.push(currentProject);
//     }

//     return projects;
//   } catch (error) {
//     throw new Error(`Failed to parse PDF: ${error.message}`);
//   }
// });
