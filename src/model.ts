export type Project = {
  id?: string;
  name: string;
  bullets: string[];
};

export interface ResumeState {
  resumeProjects: Project[];
  archivedProjects: Project[];
  allProjects: Project[];
  nonResumeProjects: Project[]; // Add this to store non-resume projects
  loadingProjects: boolean; // For fetching projects
  loadingNonResumeProjects: boolean; // Loading state for nonResumeProjects
  savingProjects: boolean; // For saving projects
}
