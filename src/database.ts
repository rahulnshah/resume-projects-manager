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

export const loadProjects = (): Project[] => {
  const stmt = db.prepare("SELECT * FROM projects");
  return stmt.all() as Project[];
};

export const loadNonResumeProjects = (
  resumeProjectNames: string[]
): Project[] => {
  if (!resumeProjectNames || resumeProjectNames.length === 0) {
    return loadProjects();
  }

  const placeholders = resumeProjectNames.map(() => "?").join(", ");
  const query = `SELECT * FROM projects WHERE name NOT IN (${placeholders})`;
  const stmt = db.prepare(query);

  // Pass the array values to the prepared statement
  return stmt.all(...resumeProjectNames) as Project[];
};
