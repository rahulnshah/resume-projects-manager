import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ResumeState, Project } from "src/model";

const initialState: ResumeState = {
  resumeProjects: [],
  archivedProjects: [],
  nonResumeProjects: [],
  allProjects: [],
  loadingProjects: false,
  loadingNonResumeProjects: false,
  savingProjects: false,
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
  async (_, { getState }) => {
    const state = getState() as { resume: ResumeState };
    const projects = state.resume.archivedProjects;

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

export const { archiveProject, clearArchivedProjects } = resumeSlice.actions;
export default resumeSlice.reducer;
