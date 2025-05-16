import { configureStore } from "@reduxjs/toolkit";
import resumeReducer from "./resumeSlice";
import themeReducer from "./themeSlice";

export const store = configureStore({
  reducer: {
    resume: resumeReducer,
    theme: themeReducer, // Add theme reducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
