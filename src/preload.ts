// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import { Project } from "./model";
contextBridge.exposeInMainWorld("api", {
  loadProjects: () => ipcRenderer.invoke("load-projects"),
  loadNonResumeProjects: (resumeProjectNames: string[]) =>
    ipcRenderer.invoke("load-non-resume-projects", resumeProjectNames),
  showOpenFilePicker: async (options: any) => {
    return await ipcRenderer.invoke("show-open-file-picker", options);
  },
  readFile: async (filePath: string) => {
    return await ipcRenderer.invoke("read-file", filePath);
  },
  saveProjects: async (projects: Project[]) => {
    return await ipcRenderer.invoke("save-projects", projects);
  },
  selectSaveLocation: () => ipcRenderer.invoke("select-save-location"),
  savePdf: (options: any) => ipcRenderer.invoke("save-pdf", options),
});
