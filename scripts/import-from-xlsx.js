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
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

if (replace) {
  db.exec('DELETE FROM internships');
}

const workbook = xlsx.readFile(inputPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

const insert = db.prepare(`
  INSERT INTO internships (company, status, notes, website, tag, updated_at)
  VALUES (?, ?, ?, ?, ?, datetime('now'))
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

  insert.run(
    String(company).trim(),
    String(status).trim(),
    String(notes).trim(),
    String(website).trim(),
    String(tag).trim()
  );
  inserted += 1;
}

const rowsForExcel = db
  .prepare(
    `SELECT company, status, notes, website, tag, created_at, updated_at FROM internships ORDER BY id DESC`
  )
  .all();

const header = [[
  'Company',
  'Status',
  'Notes',
  'Website',
  'Tag',
  'Created At',
  'Updated At'
]];
const body = rowsForExcel.map((row) => [
  row.company,
  row.status,
  row.notes || '',
  row.website || '',
  row.tag || '',
  row.created_at,
  row.updated_at
]);
const worksheet = xlsx.utils.aoa_to_sheet([...header, ...body]);
const outBook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(outBook, worksheet, 'Internships');
xlsx.writeFile(outBook, excelPath);

console.log(`Imported ${inserted} rows from ${sheetName}.`);
console.log(`Excel export written to ${excelPath}`);
