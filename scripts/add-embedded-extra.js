import path from 'path';
import Database from 'better-sqlite3';
import xlsx from 'xlsx';

const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'internships.db');
const excelPath = path.join(dataDir, 'internships.xlsx');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS internships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    website TEXT,
    tag TEXT,
    fit_score INTEGER DEFAULT 0,
    applied_at TEXT,
    followup_at TEXT,
    priority TEXT DEFAULT 'Medium',
    focus_tags TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

const rows = [
  { company: 'Continental', website: 'https://www.continental.com', tag: 'Hanover, DE' },
  { company: 'ZF Friedrichshafen', website: 'https://www.zf.com', tag: 'Friedrichshafen, DE' },
  { company: 'KUKA', website: 'https://www.kuka.com', tag: 'Augsburg, DE' },
  { company: 'STMicroelectronics', website: 'https://www.st.com', tag: 'Geneva, CH' }
];

const insert = db.prepare(`
  INSERT INTO internships (company, status, notes, website, tag, priority, focus_tags, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);

const findExisting = db.prepare(
  'SELECT id FROM internships WHERE lower(company) = lower(?) AND lower(tag) = lower(?)'
);

let inserted = 0;
rows.forEach((row) => {
  const exists = findExisting.get(row.company, row.tag);
  if (exists) return;
  const notes = '2026 Summer | Targeted for embedded + security trajectory. Initiative application.';
  insert.run(
    row.company,
    'Researching',
    notes,
    row.website,
    row.tag,
    'Medium',
    'Embedded,Firmware,Systems,Hardware'
  );
  inserted += 1;
});

const all = db
  .prepare(
    'SELECT id, company, status, notes, website, tag, fit_score, applied_at, followup_at, priority, focus_tags, created_at, updated_at FROM internships ORDER BY id DESC'
  )
  .all();

const header = [[
  'Id',
  'Company',
  'Status',
  'Notes',
  'Website',
  'Tag',
  'Fit Score',
  'Applied At',
  'Follow-up At',
  'Priority',
  'Focus Tags',
  'Created At',
  'Updated At'
]];
const body = all.map((row) => [
  row.id,
  row.company,
  row.status,
  row.notes || '',
  row.website || '',
  row.tag || '',
  row.fit_score ?? 0,
  row.applied_at || '',
  row.followup_at || '',
  row.priority || 'Medium',
  row.focus_tags || '',
  row.created_at,
  row.updated_at
]);
const worksheet = xlsx.utils.aoa_to_sheet([...header, ...body]);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, 'Internships');
xlsx.writeFile(workbook, excelPath);

console.log(`Inserted ${inserted} embedded companies.`);
