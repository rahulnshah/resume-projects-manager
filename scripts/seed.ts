import Database from 'better-sqlite3';
import fs from 'fs';

// Ensure the data folder exists
if (!fs.existsSync('data')) {
  fs.mkdirSync('data');
}

const db = new Database('../projects.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    bullets TEXT NOT NULL -- Store JSON string
  );
`);

const dummyProjects = [
  {
    id: 'p1',
    name: 'Smart Coin Tracker',
    bullets: ['Built in Python', 'Tracked coins by type', 'Used Redis'],
  },
  {
    id: 'p2',
    name: 'Meal Prep Android App',
    bullets: ['Used Kotlin', 'Tracked meal macros', 'Shared between friends'],
  },
  {
    id: 'p3',
    name: 'Underwriting Adapter',
    bullets: ['Worked at Fannie Mae', 'Used Angular', 'Integrated services'],
  },
  {
    id: 'p4',
    name: 'Résumé Editor',
    bullets: ['Built in Electron', 'Used Tailwind & Redux', 'Exports PDF'],
  }
];

const insert = db.prepare(`
  INSERT OR REPLACE INTO projects (id, name, bullets)
  VALUES (@id, @name, @bullets);
`);

const insertMany = db.transaction((projects) => {
  for (const proj of projects) {
    insert.run({
      ...proj,
      bullets: JSON.stringify(proj.bullets),
    });
  }
});

insertMany(dummyProjects);

console.log('✅ Seeded projects.db');
