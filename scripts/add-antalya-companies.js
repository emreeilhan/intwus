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
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

const rows = [
  {
    company: 'EPAM Systems Türkiye',
    website: 'https://www.epam.com',
    tag: 'Antalya, TR',
    notes: '2026 Summer | Global engineering firm; Antalya OSB Technopark R&D presence.'
  },
  {
    company: 'Evant Teknoloji A.S.',
    website: 'https://evant.com.tr/en',
    tag: 'Antalya, TR',
    notes: '2026 Summer | System integrator with Antalya branch; security partnerships.'
  },
  {
    company: 'CRS CAM',
    website: 'https://www.crscam.com',
    tag: 'Antalya, TR',
    notes: '2026 Summer | Camera/vision hardware; R&D office in Antalya Technokent.'
  },
  {
    company: 'SANTSG',
    website: 'https://www.santsg.com',
    tag: 'Antalya, TR',
    notes: '2026 Summer | Head office in Antalya Technokent; engineering & R&D.'
  }
];

const findByCompany = db.prepare('SELECT id FROM internships WHERE lower(company) = lower(?)');
const insert = db.prepare(`
  INSERT INTO internships (company, status, notes, website, tag, updated_at)
  VALUES (?, ?, ?, ?, ?, datetime('now'))
`);
const update = db.prepare(`
  UPDATE internships
  SET notes = ?, website = ?, tag = ?, updated_at = datetime('now')
  WHERE id = ?
`);

let inserted = 0;
let updated = 0;
rows.forEach((row) => {
  const existing = findByCompany.get(row.company);
  if (existing) {
    update.run(row.notes, row.website, row.tag, existing.id);
    updated += 1;
  } else {
    insert.run(row.company, 'Researching', row.notes, row.website, row.tag);
    inserted += 1;
  }
});

const all = db
  .prepare(
    'SELECT id, company, status, notes, website, tag, created_at, updated_at FROM internships ORDER BY id DESC'
  )
  .all();

const header = [[
  'Id',
  'Company',
  'Status',
  'Notes',
  'Website',
  'Tag',
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
  row.created_at,
  row.updated_at
]);
const worksheet = xlsx.utils.aoa_to_sheet([...header, ...body]);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, 'Internships');
xlsx.writeFile(workbook, excelPath);

console.log(`Inserted ${inserted} rows, updated ${updated} rows.`);
