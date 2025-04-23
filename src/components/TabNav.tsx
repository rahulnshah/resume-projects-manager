import { NavLink } from "react-router-dom";

export default function TabNav() {
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
