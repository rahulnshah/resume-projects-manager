import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import ThemeToggle from "./ThemeToggle";

export default function TabNav() {
  const archivedProjects = useSelector(
    (state: RootState) => state.resume.archivedProjects
  );

  return (
    <nav className="flex gap-4 p-4 border-b">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex items-center gap-2 ${isActive ? "font-bold" : ""}`
        }
      >
        <span role="img" aria-label="resume">
          📝
        </span>
        Résumé Editor
      </NavLink>
      <NavLink
        to="/archive"
        className={({ isActive }) =>
          `flex items-center gap-2 ${isActive ? "font-bold" : ""}`
        }
      >
        <span role="img" aria-label="archive">
          🗄️
        </span>
        Project Archive
        {archivedProjects.length > 0 && (
          <span className="ml-1 px-2 py-0.5 text-xs bg-gray-200 rounded-full">
            {archivedProjects.length}
          </span>
        )}
      </NavLink>
      <NavLink
        to="/add"
        className={({ isActive }) =>
          `flex items-center gap-2 ${isActive ? "font-bold" : ""}`
        }
      >
        <span role="img" aria-label="add">
          ➕
        </span>
        Add New Project
      </NavLink>
      <ThemeToggle />
    </nav>
  );
}
