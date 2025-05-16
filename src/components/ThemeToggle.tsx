import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { toggleDarkMode } from "../store/themeSlice";

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);

  const handleToggle = () => {
    dispatch(toggleDarkMode());
    document.body.classList.toggle("dark", !darkMode);
  };

  return (
    <button
      onClick={handleToggle}
      aria-label="Toggle theme"
      className={`p-2 rounded-full ${
        darkMode ? "hover:bg-gray-200" : "dark:hover:bg-gray-700"
      }`}
    >
      {darkMode ? "☀️" : "🌙"}
    </button>
  );
}
