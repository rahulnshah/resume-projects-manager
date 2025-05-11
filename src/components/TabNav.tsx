import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";

export default function TabNav() {
  const archivedProjects = useSelector(
    (state: RootState) => state.resume.archivedProjects
  );

  return (
    <nav className="flex gap-4 p-4 border-b">
      <NavLink
        to="/"
        className={({ isActive }) => (isActive ? "font-bold" : "")}
      >
        Résumé Editor
      </NavLink>
      <NavLink
        to="/archive"
        className={({ isActive }) => (isActive ? "font-bold" : "")}
      >
        Project Archive
        {archivedProjects.length > 0 && (
          <span className="ml-1 px-2 py-0.5 text-xs bg-gray-200 rounded-full">
            {archivedProjects.length}
          </span>
        )}
      </NavLink>
      <NavLink
        to="/add"
        className={({ isActive }) => (isActive ? "font-bold" : "")}
      >
        Add New Project
      </NavLink>
    </nav>
  );
}
