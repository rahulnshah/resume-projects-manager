import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { loadProjects, loadNonResumeProjects, saveProjects } from "./database";
import * as fs from "fs/promises";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
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

// Add this handler
ipcMain.handle("save-projects", async (_, projects) => {
  return saveProjects(projects);
});

// Add handler for selecting save location
ipcMain.handle("select-save-location", async () => {
  const result = await dialog.showSaveDialog({
    filters: [{ name: "PDF Files", extensions: ["pdf"] }],
    defaultPath: "resume.pdf",
  });
  return result.filePath;
});

// Add handler for saving PDF
ipcMain.handle("save-pdf", async (_, { sourcePath, outputPath, fullText }) => {
  try {
    const pdfBytes = await fs.readFile(sourcePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const page = pages[0];
    const { width, height } = page.getSize();
    const comprehensiveRegex = /^[\w\s]+(,\s*[\w\s]+)*$/;

    // Clear existing content
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(1, 1, 1),
    });

    // Embed Times New Roman font
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    // Split text into lines for processing
    const lines = fullText.split("\n");
    let yOffset = height - 50;

    lines.forEach((line: string) => {
      if (!line.trim()) {
        yOffset -= 12;
        return; // Skip empty lines
      }

      let fontSize = 10;
      let font = timesRomanFont;
      let xOffset = 50;

      // Name (first line)
      if (lines.indexOf(line) === 0) {
        fontSize = 25;
        font = timesRomanFont;
        xOffset = (width - font.widthOfTextAtSize(line.trim(), fontSize)) / 2;
      }
      // Contact info (second line)
      else if (lines.indexOf(line) === 1) {
        xOffset = (width - font.widthOfTextAtSize(line.trim(), fontSize)) / 2;
      }
      // Section headers (all caps) and horizontal lines
      else if (/^[A-Z\s]+$/.test(line.trim())) {
        fontSize = 12;
        font = timesRomanBold;
      }
      // Bullet points
      else if (line.startsWith("-")) {
        xOffset = 70;
      } else if (line.endsWith(".")) {
        xOffset = 70;
        font = timesRomanFont;
      }
      // experience title - ends with - Present or last two digits of an year
      else if (line.endsWith("Present") || line.search(/([0-9]{2})$/) !== -1) {
        // Fix the regex check by adding !== -1
        font = timesRomanBold;
        fontSize = 10;
      }
      // Add specific check for comma-separated skills
      else if (line.trim().split(",").length > 4) {
        font = timesRomanFont; // Keep regular font for skills
        fontSize = 10;
      }
      //Draw the line
      page.drawText(line.trim(), {
        x: xOffset,
        y: yOffset,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });

      if (/^[A-Z\s]+$/.test(line.trim())) {
        yOffset -= fontSize;
        page.drawLine({
          start: { x: 50, y: yOffset },
          end: { x: width - 50, y: yOffset },
          thickness: 1,
          color: rgb(0, 0, 0),
        });
      }

      // Adjust spacing based on font size
      yOffset -= fontSize * 1.2;
    });

    const newPdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, newPdfBytes);
    return true;
  } catch (error) {
    console.error("Failed to save PDF:", error);
    return false;
  }
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
