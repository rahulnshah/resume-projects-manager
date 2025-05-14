import { Project } from "../model";

interface ProjectAPI {
  loadProjects: () => Promise<Project[]>;
  loadNonResumeProjects: (resumeProjectNames: string[]) => Promise<Project[]>; // Add this
  showOpenFilePicker: (options: any) => Promise<string[]>; // Add this
  readFile: (filePath: string) => Promise<ArrayBuffer>; // Add this
  //parsePDF: (filePath: string) => Promise<Project[]>; // Add this
  saveProjects: (projects: Project[]) => Promise<void>;
  selectSaveLocation: () => Promise<string>;
  savePdf: (options: {
    sourcePath: string;
    outputPath: string;
    fullText: string; // Add this field
  }) => Promise<boolean>;
}

declare global {
  interface Window {
    api: ProjectAPI;
  }
}
