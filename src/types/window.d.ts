interface Project {
    id: string;
    name: string;
    bullets: string[];
  }
  
  interface ProjectAPI {
    loadProjects: () => Promise<Project[]>;
  }
  
  interface Window {
    api: ProjectAPI;
  }
  