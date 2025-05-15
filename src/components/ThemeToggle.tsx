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
      className="p-2 border rounded bg-gray-200 dark:bg-blue-800 text-black dark:text-white"
    >
      {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    </button>
  );
}
