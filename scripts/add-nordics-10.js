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
  { company: 'Ericsson', website: 'https://www.ericsson.com', tag: 'Stockholm, SE', focus: 'Systems,Hardware,Embedded' },
  { company: 'Nokia', website: 'https://www.nokia.com', tag: 'Espoo, FI', focus: 'Systems,Hardware,Embedded' },
  { company: 'Volvo Group', website: 'https://www.volvogroup.com', tag: 'Gothenburg, SE', focus: 'Embedded,Hardware,Systems' },
  { company: 'Scania', website: 'https://www.scania.com', tag: 'Södertälje, SE', focus: 'Embedded,Hardware,Systems' },
  { company: 'Saab', website: 'https://www.saab.com', tag: 'Stockholm, SE', focus: 'Embedded,Hardware,Security' },
  { company: 'Axis Communications', website: 'https://www.axis.com', tag: 'Lund, SE', focus: 'Embedded,Hardware,Security' },
  { company: 'Telenor', website: 'https://www.telenor.com', tag: 'Fornebu, NO', focus: 'Security,Systems' },
  { company: 'Telia Company', website: 'https://www.teliacompany.com', tag: 'Solna, SE', focus: 'Security,Systems' },
  { company: 'Kongsberg Gruppen', website: 'https://www.kongsberg.com', tag: 'Kongsberg, NO', focus: 'Embedded,Hardware,Security' },
  { company: 'Nordic Semiconductor', website: 'https://www.nordicsemi.com', tag: 'Trondheim, NO', focus: 'Embedded,Hardware,IoT' }
];

const findExisting = db.prepare('SELECT id FROM internships WHERE lower(company) = lower(?) AND lower(tag) = lower(?)');
const insert = db.prepare(`
  INSERT INTO internships (company, status, notes, website, tag, priority, focus_tags, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);

let inserted = 0;
rows.forEach((row) => {
  const exists = findExisting.get(row.company, row.tag);
  if (exists) return;
  const notes = '2026 Summer | Nordic HQ/major office; embedded/security fit. Initiative application.';
  const priority = row.focus.includes('Embedded') || row.focus.includes('Hardware') ? 'High' : 'Medium';
  insert.run(row.company, 'Researching', notes, row.website, row.tag, priority, row.focus);
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

console.log(`Inserted ${inserted} Nordic companies.`);
