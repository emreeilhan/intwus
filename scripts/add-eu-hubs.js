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
  // FAANG / equivalent hubs (verified locations)
  {
    company: 'Amazon',
    website: 'https://www.amazon.com',
    tag: 'Luxembourg, LU',
    notes: '2026 Summer | EU HQ in Luxembourg; large-scale systems, security-adjacent teams. Initiative application.'
  },
  {
    company: 'Meta',
    website: 'https://www.meta.com',
    tag: 'Dublin, IE',
    notes: '2026 Summer | International HQ in Ireland; security & systems-adjacent roles.'
  },
  {
    company: 'Netflix',
    website: 'https://www.netflix.com',
    tag: 'Amsterdam, NL',
    notes: '2026 Summer | EMEA HQ; global teams across content, legal, finance, security-adjacent.'
  },
  {
    company: 'Netflix',
    website: 'https://www.netflix.com',
    tag: 'London, UK',
    notes: '2026 Summer | UK office connected to EMEA HQ; cross-functional tech & ops teams.'
  },
  {
    company: 'Netflix',
    website: 'https://www.netflix.com',
    tag: 'Paris, FR',
    notes: '2026 Summer | Paris office; global teams and compliance/security-adjacent work.'
  },

  // NVIDIA Europe offices
  {
    company: 'NVIDIA',
    website: 'https://www.nvidia.com',
    tag: 'Berlin, DE',
    notes: '2026 Summer | EU engineering presence; compute & security-adjacent systems.'
  },
  {
    company: 'NVIDIA',
    website: 'https://www.nvidia.com',
    tag: 'Munich, DE',
    notes: '2026 Summer | EU engineering hub; systems + embedded focus fit.'
  },
  {
    company: 'NVIDIA',
    website: 'https://www.nvidia.com',
    tag: 'Zurich, CH',
    notes: '2026 Summer | EU office; advanced systems and security-adjacent teams.'
  },
  {
    company: 'NVIDIA',
    website: 'https://www.nvidia.com',
    tag: 'Warsaw, PL',
    notes: '2026 Summer | EU office; engineering & systems roles.'
  },
  {
    company: 'NVIDIA',
    website: 'https://www.nvidia.com',
    tag: 'Helsinki, FI',
    notes: '2026 Summer | EU office; systems/embedded adjacent roles.'
  },
  {
    company: 'NVIDIA',
    website: 'https://www.nvidia.com',
    tag: 'Amsterdam, NL',
    notes: '2026 Summer | EU office; systems & security fit.'
  },
  {
    company: 'NVIDIA',
    website: 'https://www.nvidia.com',
    tag: 'London, UK',
    notes: '2026 Summer | EU office; engineering & security-adjacent roles.'
  },
  {
    company: 'NVIDIA',
    website: 'https://www.nvidia.com',
    tag: 'Cambridge, UK',
    notes: '2026 Summer | EU office; engineering & systems roles.'
  },

  // Arm global offices (EU)
  {
    company: 'Arm',
    website: 'https://www.arm.com',
    tag: 'Cambridge, UK',
    notes: '2026 Summer | Global HQ; embedded systems & security focus.'
  },
  {
    company: 'Arm',
    website: 'https://www.arm.com',
    tag: 'Manchester, UK',
    notes: '2026 Summer | Engineering office; embedded systems fit.'
  },
  {
    company: 'Arm',
    website: 'https://www.arm.com',
    tag: 'Bristol, UK',
    notes: '2026 Summer | Engineering office; firmware/embedded fit.'
  },
  {
    company: 'Arm',
    website: 'https://www.arm.com',
    tag: 'Sophia Antipolis, FR',
    notes: '2026 Summer | Engineering office; systems + security-adjacent roles.'
  },
  {
    company: 'Arm',
    website: 'https://www.arm.com',
    tag: 'Aschheim, DE',
    notes: '2026 Summer | Engineering office; embedded focus.'
  },
  {
    company: 'Arm',
    website: 'https://www.arm.com',
    tag: 'Galway, IE',
    notes: '2026 Summer | Engineering office; embedded systems fit.'
  },
  {
    company: 'Arm',
    website: 'https://www.arm.com',
    tag: 'Lund, SE',
    notes: '2026 Summer | Engineering office; embedded systems fit.'
  },
  {
    company: 'Arm',
    website: 'https://www.arm.com',
    tag: 'Oslo, NO',
    notes: '2026 Summer | Engineering office; embedded systems fit.'
  },

  // SAP (Germany locations)
  {
    company: 'SAP',
    website: 'https://www.sap.com',
    tag: 'Walldorf, DE',
    notes: '2026 Summer | Global HQ; large-scale systems & security-adjacent roles.'
  },
  {
    company: 'SAP',
    website: 'https://www.sap.com',
    tag: 'Berlin, DE',
    notes: '2026 Summer | SAP Berlin office; enterprise systems & security-adjacent roles.'
  },
  {
    company: 'SAP',
    website: 'https://www.sap.com',
    tag: 'Frankfurt, DE',
    notes: '2026 Summer | SAP Frankfurt office (Eschborn); enterprise systems roles.'
  },

  // Microsoft (EU offices from worldwide sites)
  {
    company: 'Microsoft',
    website: 'https://www.microsoft.com',
    tag: 'Reading, UK',
    notes: '2026 Summer | Microsoft Campus (Thames Valley Park); systems & security-adjacent.'
  },
  {
    company: 'Microsoft',
    website: 'https://www.microsoft.com',
    tag: 'Warsaw, PL',
    notes: '2026 Summer | Microsoft Poland office; systems & security-adjacent.'
  },
  {
    company: 'Microsoft',
    website: 'https://www.microsoft.com',
    tag: 'Madrid, ES',
    notes: '2026 Summer | Microsoft Spain office; systems & cloud security-adjacent.'
  },
  {
    company: 'Microsoft',
    website: 'https://www.microsoft.com',
    tag: 'Stockholm, SE',
    notes: '2026 Summer | Microsoft Sweden office; systems & security-adjacent.'
  },
  {
    company: 'Microsoft',
    website: 'https://www.microsoft.com',
    tag: 'Zurich, CH',
    notes: '2026 Summer | Microsoft Switzerland office; systems & security-adjacent.'
  }
];

const findExisting = db.prepare(
  'SELECT id FROM internships WHERE lower(company) = lower(?) AND lower(tag) = lower(?)'
);
const insert = db.prepare(`
  INSERT INTO internships (company, status, notes, website, tag, updated_at)
  VALUES (?, ?, ?, ?, ?, datetime('now'))
`);
const update = db.prepare(`
  UPDATE internships
  SET notes = ?, website = ?, updated_at = datetime('now')
  WHERE id = ?
`);

let inserted = 0;
let updated = 0;
rows.forEach((row) => {
  const existing = findExisting.get(row.company, row.tag);
  if (existing) {
    update.run(row.notes, row.website, existing.id);
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
