interface Project {
  id: string;
  name: string;
  bullets: string[];
}

interface ProjectAPI {
  loadProjects: () => Promise<Project[]>;
  loadNonResumeProjects: (resumeProjectNames: string[]) => Promise<Project[]>; // Add this
  showOpenFilePicker: (options: any) => Promise<string[]>; // Add this
  readFile: (filePath: string) => Promise<ArrayBuffer>; // Add this
  //parsePDF: (filePath: string) => Promise<Project[]>; // Add this
  saveProjects: (projects: Project[]) => Promise<void>;
}

interface Window {
  api: ProjectAPI;
}
