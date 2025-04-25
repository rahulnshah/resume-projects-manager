import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ResumeState } from "src/model";
import { Project } from "src/model";
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

const resumeSlice = createSlice({
  name: "resume",
  initialState,
  reducers: {
    // will fill these in later
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
      });
  },
});

export const {} = resumeSlice.actions;
export default resumeSlice.reducer;
