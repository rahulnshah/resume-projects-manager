import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ResumeState, Project } from "src/model";

const initialState: ResumeState = {
  resumeProjects: [],
  archivedProjects: [],
  nonResumeProjects: [],
  loadingProjects: false,
  loadingNonResumeProjects: false,
  savingProjects: false,
  sourcePdfPath: "", // Add this
};

// Thunk to fetch projects
export const fetchProjects = createAsyncThunk(
  "resume/fetchProjects",
  async (parsedProjects: Project[]) => {
    return parsedProjects;
  }
);

// Thunk to fetch non-resume projects
export const fetchNonResumeProjects = createAsyncThunk(
  "resume/fetchNonResumeProjects",
  async (resumeProjectNames: string[]) => {
    // Call the API to fetch non-resume projects
    const nonResumeProjects = await window.api.loadNonResumeProjects(
      resumeProjectNames
    );
    return nonResumeProjects;
  }
);

// Add new thunk for saving archived projects
export const saveArchivedProjects = createAsyncThunk(
  "resume/saveArchivedProjects",
  async (editedProjects: { [key: string]: Project }, { getState }) => {
    const state = getState() as { resume: ResumeState };
    const projects = state.resume.archivedProjects.map((project) => ({
      ...project,
      bullets: editedProjects[project.name]?.bullets || project.bullets,
    }));

    // Save to SQLite via IPC
    await window.api.saveProjects(projects);
    return projects;
  }
);

const resumeSlice = createSlice({
  name: "resume",
  initialState,
  reducers: {
    archiveProject: (state, action: PayloadAction<Project>) => {
      // Remove from resume projects
      state.resumeProjects = state.resumeProjects.filter(
        (p) => p.name !== action.payload.name
      );
      // Add to archived projects if not already there
      if (!state.archivedProjects.find((p) => p.name === action.payload.name)) {
        state.archivedProjects.push(action.payload);
      }
    },
    clearArchivedProjects: (state) => {
      state.archivedProjects = [];
    },
    swapProject: (
      state,
      action: PayloadAction<{ oldProject: Project; newProject: Project }>
    ) => {
      const { oldProject, newProject } = action.payload;
      state.resumeProjects = state.resumeProjects.map((p) =>
        p.name === oldProject.name ? newProject : p
      );
    },
    restoreProject: (state, action: PayloadAction<Project>) => {
      // Remove from archived projects
      state.archivedProjects = state.archivedProjects.filter(
        (p) => p.name !== action.payload.name
      );
      // Add to resume projects
      state.resumeProjects.push(action.payload);
    },
    setSourcePdfPath: (state, action: PayloadAction<string>) => {
      state.sourcePdfPath = action.payload;
    },
    reorderProjects: (
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) => {
      const { fromIndex, toIndex } = action.payload;
      const [movedProject] = state.resumeProjects.splice(fromIndex, 1);
      state.resumeProjects.splice(toIndex, 0, movedProject);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loadingProjects = true;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loadingProjects = false;
        state.resumeProjects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state) => {
        state.loadingProjects = false;
      })
      // Fetch nonResumeProjects
      .addCase(fetchNonResumeProjects.pending, (state) => {
        state.loadingNonResumeProjects = true;
      })
      .addCase(fetchNonResumeProjects.fulfilled, (state, action) => {
        state.loadingNonResumeProjects = false;
        state.nonResumeProjects = action.payload;
      })
      .addCase(fetchNonResumeProjects.rejected, (state) => {
        state.loadingNonResumeProjects = false;
      })
      .addCase(saveArchivedProjects.pending, (state) => {
        state.savingProjects = true;
      })
      .addCase(saveArchivedProjects.fulfilled, (state) => {
        state.savingProjects = false;
        state.archivedProjects = []; // Clear after saving
      })
      .addCase(saveArchivedProjects.rejected, (state) => {
        state.savingProjects = false;
      });
  },
});

export const {
  archiveProject,
  clearArchivedProjects,
  swapProject,
  restoreProject,
  setSourcePdfPath, // Add this
  reorderProjects,
} = resumeSlice.actions;
export default resumeSlice.reducer;
