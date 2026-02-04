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
  // Amazon (EU hubs referenced in Amazon official content)
  {
    company: 'Amazon',
    website: 'https://www.amazon.com',
    tag: 'Luxembourg, LU',
    notes: '2026 Summer | EU corporate hub; systems & operations scale. Initiative application.'
  },
  {
    company: 'Amazon',
    website: 'https://www.amazon.com',
    tag: 'London, UK',
    notes: '2026 Summer | EU tech & business hub. Initiative application.'
  },
  {
    company: 'Amazon',
    website: 'https://www.amazon.com',
    tag: 'Munich, DE',
    notes: '2026 Summer | EU tech hub (Germany). Initiative application.'
  },
  {
    company: 'Amazon',
    website: 'https://www.amazon.com',
    tag: 'Paris, FR',
    notes: '2026 Summer | EU hub (France). Initiative application.'
  },
  {
    company: 'Amazon',
    website: 'https://www.amazon.com',
    tag: 'Berlin, DE',
    notes: '2026 Summer | EU hub (Germany). Initiative application.'
  },

  // Meta
  {
    company: 'Meta',
    website: 'https://www.meta.com',
    tag: 'Dublin, IE',
    notes: '2026 Summer | International HQ in Ireland; security & systems-adjacent teams.'
  },

  // Google
  {
    company: 'Google',
    website: 'https://www.google.com',
    tag: 'Zurich, CH',
    notes: '2026 Summer | Major European engineering hub; systems & security fit.'
  },

  // Apple
  {
    company: 'Apple',
    website: 'https://www.apple.com',
    tag: 'Cork, IE',
    notes: '2026 Summer | Operations & engineering teams in Ireland.'
  },

  // Netflix
  {
    company: 'Netflix',
    website: 'https://www.netflix.com',
    tag: 'Amsterdam, NL',
    notes: '2026 Summer | EMEA HQ in Amsterdam.'
  },
  {
    company: 'Netflix',
    website: 'https://www.netflix.com',
    tag: 'London, UK',
    notes: '2026 Summer | UK office connected to EMEA HQ; teams across functions.'
  }
];

const findExisting = db.prepare(
  'SELECT id FROM internships WHERE lower(company) = lower(?) AND lower(tag) = lower(?) AND lower(website) = lower(?)'
);
const insert = db.prepare(`
  INSERT INTO internships (company, status, notes, website, tag, updated_at)
  VALUES (?, ?, ?, ?, ?, datetime('now'))
`);
const update = db.prepare(`
  UPDATE internships
  SET notes = ?, updated_at = datetime('now')
  WHERE id = ?
`);

let inserted = 0;
let updated = 0;
rows.forEach((row) => {
  const existing = findExisting.get(row.company, row.tag, row.website);
  if (existing) {
    update.run(row.notes, existing.id);
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
