interface Project {
  id: string;
  name: string;
  bullets: string[];
}

interface ProjectAPI {
  loadProjects: () => Promise<Project[]>;
  showOpenFilePicker: (options: any) => Promise<string[]>; // Add this
  readFile: (filePath: string) => Promise<ArrayBuffer>; // Add this
  //parsePDF: (filePath: string) => Promise<Project[]>; // Add this
}

interface Window {
  api: ProjectAPI;
}
