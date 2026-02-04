import path from 'path';
import Database from 'better-sqlite3';
import xlsx from 'xlsx';

const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'internships.db');
const excelPath = path.join(dataDir, 'internships.xlsx');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const rows = db.prepare('SELECT id, focus_tags, priority FROM internships').all();
const update = db.prepare('UPDATE internships SET priority = ? WHERE id = ?');
let updated = 0;
rows.forEach((row) => {
  const tags = String(row.focus_tags || '').toLowerCase();
  let next = row.priority || 'Medium';
  if (tags.includes('embedded') || tags.includes('hardware') || tags.includes('firmware')) {
    next = 'High';
  } else if (tags.includes('security')) {
    next = 'Medium';
  }
  if (next !== row.priority) {
    update.run(next, row.id);
    updated += 1;
  }
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

console.log(`Updated priorities: ${updated}`);
