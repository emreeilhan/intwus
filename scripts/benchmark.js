import Database from 'better-sqlite3';
import fs from 'fs';

function computeFitScore({ company, status, notes, website, tag }) {
  const text = [company, status, notes, website, tag].join(' ').toLowerCase();
  let score = 1;
  const strong = [
    'embedded', 'firmware', 'microcontroller', 'soc', 'iot', 'rtos',
    'security', 'secure', 'cyber', 'infosec', 'soc', 'threat',
    'automotive', 'industrial', 'ics', 'scada', 'defense', 'hardware'
  ];
  const medium = [
    'systems', 'system', 'low-level', 'kernel', 'device', 'network',
    'telecom', 'semiconductor', 'silicon'
  ];

  const strongHits = strong.filter((k) => text.includes(k)).length;
  const mediumHits = medium.filter((k) => text.includes(k)).length;

  score += Math.min(2, Math.floor(strongHits / 2));
  score += Math.min(1, Math.floor(mediumHits / 2));

  if (text.includes('embedded security')) score += 1;
  if (text.includes('secure systems')) score += 1;

  return Math.max(1, Math.min(5, score));
}

// Create a temp database for benchmark
if (fs.existsSync('benchmark.db')) fs.unlinkSync('benchmark.db');
const db = new Database('benchmark.db');
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE internships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    website TEXT,
    tag TEXT,
    fit_score INTEGER DEFAULT 0
  );
`);

// Insert 100,000 rows
const insert = db.prepare(`INSERT INTO internships (company, status, notes, website, tag) VALUES (?, ?, ?, ?, ?)`);
db.transaction(() => {
  for (let i = 0; i < 100000; i++) {
    insert.run('Company ' + i, 'status', 'notes with embedded security', 'website', 'tag');
  }
})();

console.log('Database seeded with 100,000 rows.');

function backfillFitScoresBaseline() {
  const rows = db.prepare(`
    SELECT id, company, status, notes, website, tag
    FROM internships
    WHERE fit_score IS NULL OR fit_score = 0
  `).all();
  const updateScore = db.prepare(`UPDATE internships SET fit_score = ? WHERE id = ?`);
  rows.forEach((row) => {
    const score = computeFitScore(row);
    updateScore.run(score, row.id);
  });
}

function backfillFitScoresOptimized() {
  const rows = db.prepare(`
    SELECT id, company, status, notes, website, tag
    FROM internships
    WHERE fit_score IS NULL OR fit_score = 0
  `).all();
  const updateScore = db.prepare(`UPDATE internships SET fit_score = ? WHERE id = ?`);
  db.transaction(() => {
    rows.forEach((row) => {
      const score = computeFitScore(row);
      updateScore.run(score, row.id);
    });
  })();
}

// Measure Baseline
console.log('Measuring baseline...');
db.exec(`UPDATE internships SET fit_score = 0`); // Reset
const t0 = performance.now();
backfillFitScoresBaseline();
const t1 = performance.now();
console.log(`Baseline (no transaction): ${t1 - t0} ms`);

// Measure Optimized
console.log('Measuring optimized...');
db.exec(`UPDATE internships SET fit_score = 0`); // Reset
const t2 = performance.now();
backfillFitScoresOptimized();
const t3 = performance.now();
console.log(`Optimized (with transaction): ${t3 - t2} ms`);
