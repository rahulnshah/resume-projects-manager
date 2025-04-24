export type Project = {
  id?: string;
  name: string;
  bullets: string[];
};

export interface ResumeState {
  resumeProjects: Project[];
  archivedProjects: Project[];
  allProjects: Project[];
  loadingProjects: boolean; // For fetching projects
  savingProjects: boolean; // For saving projects
}
