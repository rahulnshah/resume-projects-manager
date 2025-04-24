import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ResumeState } from "src/model";
import { Project } from "src/model";
const initialState: ResumeState = {
  resumeProjects: [],
  archivedProjects: [],
  allProjects: [],
  loadingProjects: false,
  savingProjects: false,
};
// Thunk to fetch projects
export const fetchProjects = createAsyncThunk(
  "resume/fetchProjects",
  async (parsedProjects: Project[]) => {
    return parsedProjects;
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
      });
  },
});

export const {} = resumeSlice.actions;
export default resumeSlice.reducer;
