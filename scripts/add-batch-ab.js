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

const embeddedHardware = [
  { company: 'ASML', website: 'https://www.asml.com', tag: 'Veldhoven, NL' },
  { company: 'NXP Semiconductors', website: 'https://www.nxp.com', tag: 'Eindhoven, NL' },
  { company: 'Arm', website: 'https://www.arm.com', tag: 'Cambridge, UK' },
  { company: 'Infineon Technologies', website: 'https://www.infineon.com', tag: 'Neubiberg, DE' },
  { company: 'Bosch', website: 'https://www.bosch.com', tag: 'Gerlingen, DE' },
  { company: 'Siemens', website: 'https://www.siemens.com', tag: 'Munich, DE' },
  { company: 'Ericsson', website: 'https://www.ericsson.com', tag: 'Stockholm, SE' },
  { company: 'Nexperia', website: 'https://www.nexperia.com', tag: 'Nijmegen, NL' },
  { company: 'Rohde & Schwarz', website: 'https://www.rohde-schwarz.com', tag: 'Munich, DE' },
  { company: 'ABB', website: 'https://www.abb.com', tag: 'Zurich, CH' }
];

const cybersecurity = [
  { company: 'WithSecure', website: 'https://www.withsecure.com', tag: 'Helsinki, FI' },
  { company: 'NCC Group', website: 'https://www.nccgroupplc.com', tag: 'Manchester, UK' },
  { company: 'ESET', website: 'https://www.eset.com', tag: 'Bratislava, SK' },
  { company: 'Avira', website: 'https://www.avira.com', tag: 'Tettnang, DE' },
  { company: 'G DATA', website: 'https://www.gdatasoftware.com', tag: 'Bochum, DE' },
  { company: 'Panda Security', website: 'https://www.pandasecurity.com', tag: 'Bilbao, ES' },
  { company: 'Sophos', website: 'https://www.sophos.com', tag: 'Abingdon, UK' },
  { company: 'Darktrace', website: 'https://www.darktrace.com', tag: 'Cambridge, UK' },
  { company: 'Bitdefender', website: 'https://www.bitdefender.com', tag: 'Bucharest, RO' },
  { company: 'Mimecast', website: 'https://www.mimecast.com', tag: 'London, UK' }
];

const insert = db.prepare(`
  INSERT INTO internships (company, status, notes, website, tag, priority, focus_tags, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);

const findExisting = db.prepare(
  'SELECT id FROM internships WHERE lower(company) = lower(?) AND lower(tag) = lower(?)'
);

function addRows(rows, focusTags) {
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
      focusTags.join(',')
    );
    inserted += 1;
  });
  return inserted;
}

const insertedEmbedded = addRows(embeddedHardware, ['Embedded', 'Firmware', 'Systems', 'Hardware']);
const insertedCyber = addRows(cybersecurity, ['Security', 'Systems']);

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

console.log(`Inserted embedded/hardware: ${insertedEmbedded}`);
console.log(`Inserted cybersecurity: ${insertedCyber}`);
