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
    company: 'ASELSAN',
    website: 'https://www.aselsan.com/en',
    tag: 'Turkey, TR',
    notes: '2026 Summer | Embedded systems, defense tech and secure systems odakli ekipler.'
  },
  {
    company: 'HAVELSAN',
    website: 'https://www.havelsan.com',
    tag: 'Turkey, TR',
    notes: '2026 Summer | Cybersecurity, command-control, simulation ve secure software odakli ekipler.'
  },
  {
    company: 'Turkish Aerospace (TUSAŞ)',
    website: 'https://www.tusas.com',
    tag: 'Turkey, TR',
    notes: '2026 Summer | Aerospace + embedded systems, secure systems ve avionics odakli ekipler.'
  },
  {
    company: 'ROKETSAN',
    website: 'https://www.roketsan.com.tr',
    tag: 'Turkey, TR',
    notes: '2026 Summer | Embedded systems, guidance/control ve güvenlik odakli ekipler.'
  },
  {
    company: 'STM Savunma Teknolojileri',
    website: 'https://www.stm.com.tr',
    tag: 'Turkey, TR',
    notes: '2026 Summer | Cybersecurity, command-control ve embedded sistemler.'
  },
  {
    company: 'Turkcell',
    website: 'https://www.turkcell.com.tr',
    tag: 'Turkey, TR',
    notes: '2026 Summer | Telecom-scale systems, security engineering ve detection odakli ekipler.'
  },
  {
    company: 'Türk Telekom',
    website: 'https://www.turktelekom.com.tr/en',
    tag: 'Turkey, TR',
    notes: '2026 Summer | Network/security ve large-scale systems odakli ekipler.'
  },
  {
    company: 'Arçelik',
    website: 'https://www.arcelikglobal.com/en',
    tag: 'Turkey, TR',
    notes: '2026 Summer | Embedded/IoT cihazlar, secure firmware ve product security odakli ekipler.'
  },
  {
    company: 'Vestel',
    website: 'https://www.vestel.com',
    tag: 'Turkey, TR',
    notes: '2026 Summer | IoT/embedded cihazlar ve güvenli ürün geliştirme odakli ekipler.'
  },
  {
    company: 'Ford Otosan',
    website: 'https://www.fordotosan.com.tr',
    tag: 'Turkey, TR',
    notes: '2026 Summer | Otomotiv embedded, vehicle security ve sistem engineering odakli ekipler.'
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
