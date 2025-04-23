import Database from "better-sqlite3";

const db = new Database("projects.db");

// Only create table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    bullets TEXT NOT NULL -- Stored as JSON string
  );
`);

export interface Project {
  id: string;
  name: string;
  bullets: string[];
}

export const loadProjects = (): Project[] => {
  const stmt = db.prepare("SELECT * FROM projects");
  return stmt.all() as Project[];
};
