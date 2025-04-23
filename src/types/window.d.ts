interface Project {
  id: string;
  name: string;
  bullets: string[];
}

interface ProjectAPI {
  loadProjects: () => Promise<Project[]>;
  showOpenFilePicker: (options: any) => Promise<FileSystemFileHandle[]>; // Add this
}

interface Window {
  api: ProjectAPI;
}
