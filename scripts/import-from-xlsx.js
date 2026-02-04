import fs from 'fs';
import os from 'os';
import path from 'path';
import Database from 'better-sqlite3';
import xlsx from 'xlsx';

const defaultPath = path.join(
  os.homedir(),
  'Downloads',
  'ortakVeritabaniGelismisAmaIncelenecek (3).xlsx'
);

const inputPath = process.argv[2] || defaultPath;
const replace = process.argv.includes('--replace');

if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'internships.db');
const excelPath = path.join(dataDir, 'internships.xlsx');

fs.mkdirSync(dataDir, { recursive: true });

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

const columns = db.prepare(`PRAGMA table_info(internships);`).all();
const hasFitScore = columns.some((col) => col.name === 'fit_score');
if (!hasFitScore) {
  db.exec(`ALTER TABLE internships ADD COLUMN fit_score INTEGER DEFAULT 0;`);
}
const hasAppliedAt = columns.some((col) => col.name === 'applied_at');
if (!hasAppliedAt) {
  db.exec(`ALTER TABLE internships ADD COLUMN applied_at TEXT;`);
}
const hasFollowupAt = columns.some((col) => col.name === 'followup_at');
if (!hasFollowupAt) {
  db.exec(`ALTER TABLE internships ADD COLUMN followup_at TEXT;`);
}
const hasPriority = columns.some((col) => col.name === 'priority');
if (!hasPriority) {
  db.exec(`ALTER TABLE internships ADD COLUMN priority TEXT DEFAULT 'Medium';`);
}
const hasFocusTags = columns.some((col) => col.name === 'focus_tags');
if (!hasFocusTags) {
  db.exec(`ALTER TABLE internships ADD COLUMN focus_tags TEXT DEFAULT '';`);
}

if (replace) {
  db.exec('DELETE FROM internships');
}

const workbook = xlsx.readFile(inputPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

const insert = db.prepare(`
  INSERT INTO internships (company, status, notes, website, tag, fit_score, applied_at, followup_at, priority, focus_tags, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);

let inserted = 0;
for (const row of rows) {
  const company =
    row['Şirket'] ||
    row['Sirket'] ||
    row['Company'] ||
    row['company'] ||
    '';
  if (!company) continue;

  const notes =
    row['Açıklama'] ||
    row['Aciklama'] ||
    row['Notes'] ||
    row['notes'] ||
    '';

  const website = row['URL'] || row['Website'] || row['website'] || '';
  const tag = row['Şehir'] || row['Sehir'] || row['Tag'] || row['tag'] || '';
  const status = row['Durum'] || row['Status'] || row['status'] || 'Researching';
  const fitScore = Number(row['Fit Score'] || row['FitScore'] || 0) || 0;
  const appliedAt = row['Applied At'] || row['AppliedAt'] || '';
  const followupAt = row['Follow-up At'] || row['Followup At'] || row['FollowupAt'] || '';
  const priority = row['Priority'] || 'Medium';
  const focusTags = row['Focus Tags'] || row['FocusTags'] || '';

  insert.run(
    String(company).trim(),
    String(status).trim(),
    String(notes).trim(),
    String(website).trim(),
    String(tag).trim(),
    fitScore,
    appliedAt ? String(appliedAt).trim() : null,
    followupAt ? String(followupAt).trim() : null,
    String(priority).trim() || 'Medium',
    String(focusTags).trim()
  );
  inserted += 1;
}

const rowsForExcel = db
  .prepare(
    `SELECT company, status, notes, website, tag, fit_score, applied_at, followup_at, priority, focus_tags, created_at, updated_at FROM internships ORDER BY id DESC`
  )
  .all();

const header = [[
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
const body = rowsForExcel.map((row) => [
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
const outBook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(outBook, worksheet, 'Internships');
xlsx.writeFile(outBook, excelPath);

console.log(`Imported ${inserted} rows from ${sheetName}.`);
console.log(`Excel export written to ${excelPath}`);
