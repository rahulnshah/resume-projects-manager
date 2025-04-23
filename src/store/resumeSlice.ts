import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

type Project = {
  id?: string;
  name: string;
  bullets: string[];
};

interface ResumeState {
  resumeProjects: Project[];
  archivedProjects: Project[];
  allProjects: Project[];
  loadingProjects: boolean; // For fetching projects
  savingProjects: boolean; // For saving projects
}

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
  async () => {
    const projects = await window.api.loadProjects();
    return [
      {
        name: "Smart Coin Tracker",
        bullets: ["Built in Python", "Tracked coins by type", "Used Redis"],
      },
      {
        name: "Meal Prep Android App",
        bullets: [
          "Used Kotlin",
          "Tracked meal macros",
          "Shared between friends",
        ],
      },
      {
        name: "Underwriting Adapter",
        bullets: [
          "Worked at Fannie Mae",
          "Used Angular",
          "Integrated third-party services",
        ],
      },
    ];
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
