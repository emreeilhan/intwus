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
    company: 'ASML',
    website: 'https://www.asml.com',
    tag: 'Veldhoven, NL',
    notes: '2026 Summer | Semiconductor tooling; embedded + systems security odakli ekipler. Initiative application.'
  },
  {
    company: 'NXP Semiconductors',
    website: 'https://www.nxp.com',
    tag: 'Eindhoven, NL',
    notes: '2026 Summer | Embedded security, hardware-backed systems, SoC ve firmware odakli ekipler.'
  },
  {
    company: 'Philips',
    website: 'https://www.philips.com',
    tag: 'Amsterdam, NL',
    notes: '2026 Summer | Medical/health-tech sistemler; embedded + güvenlik odakli ekipler.'
  },
  {
    company: 'Thales Nederland',
    website: 'https://www.thalesgroup.com',
    tag: 'Hengelo, NL',
    notes: '2026 Summer | Defense & cybersecurity; secure systems ve embedded güvenlik odakli ekipler.'
  },
  {
    company: 'Nexperia',
    website: 'https://www.nexperia.com',
    tag: 'Nijmegen, NL',
    notes: '2026 Summer | Semiconductor; embedded güvenlik ve donanim-odakli ekipler.'
  },
  {
    company: 'ASM International',
    website: 'https://www.asm.com',
    tag: 'Almere, NL',
    notes: '2026 Summer | Semiconductor manufacturing equipment; systems/embedded odakli ekipler.'
  },
  {
    company: 'Fox-IT',
    website: 'https://www.fox-it.com',
    tag: 'Delft, NL',
    notes: '2026 Summer | Blue-team & incident-response kültürü; security engineering odakli ekipler.'
  },
  {
    company: 'Eye Security',
    website: 'https://www.eye.security',
    tag: 'The Hague, NL',
    notes: '2026 Summer | Managed detection & response; security operations mindset odakli ekipler.'
  },
  {
    company: 'TomTom',
    website: 'https://www.tomtom.com',
    tag: 'Amsterdam, NL',
    notes: '2026 Summer | Automotive navigation & location tech; embedded/vehicle systems odakli ekipler.'
  },
  {
    company: 'TOPIC Embedded Systems',
    website: 'https://www.topic.nl',
    tag: 'Eindhoven, NL',
    notes: '2026 Summer | Embedded systems consultancy; firmware ve low-level sistemler.'
  }
];

const findByCompany = db.prepare('SELECT id, status FROM internships WHERE lower(company) = lower(?)');
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
