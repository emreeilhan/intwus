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

const insert = db.prepare(`
  INSERT INTO internships (company, status, notes, website, tag, updated_at)
  VALUES (?, ?, ?, ?, ?, datetime('now'))
`);

const rows = [
  // Stuttgart
  {
    company: 'Robert Bosch GmbH',
    website: 'https://www.bosch.com',
    tag: 'Stuttgart, Almanya',
    notes: '2026 Summer | Embedded systems & security-focused teams (automotive/industrial).'
  },
  {
    company: 'ETAS GmbH',
    website: 'https://www.etas.com',
    tag: 'Stuttgart, Almanya',
    notes: '2026 Summer | Embedded systems tools, embedded security & automotive software.'
  },
  {
    company: 'Vector Informatik',
    website: 'https://www.vector.com',
    tag: 'Stuttgart, Almanya',
    notes: '2026 Summer | Embedded/ECU software tooling; strong systems focus.'
  },
  {
    company: 'Bosch Rexroth',
    website: 'https://www.boschrexroth.com',
    tag: 'Stuttgart, Almanya',
    notes: '2026 Summer | Industrial automation/control systems; embedded + safety.'
  },
  {
    company: 'Porsche AG',
    website: 'https://www.porsche.com',
    tag: 'Stuttgart, Almanya',
    notes: '2026 Summer | Automotive embedded systems & security-adjacent roles.'
  },

  // Bayern (Munich area)
  {
    company: 'Infineon Technologies',
    website: 'https://www.infineon.com',
    tag: 'Bayern, Almanya',
    notes: '2026 Summer | Semiconductors, embedded security, hardware-backed systems.'
  },
  {
    company: 'NXP Semiconductors',
    website: 'https://www.nxp.com',
    tag: 'Bayern, Almanya',
    notes: '2026 Summer | Embedded semiconductors for automotive/industrial.'
  },
  {
    company: 'Rohde & Schwarz',
    website: 'https://www.rohde-schwarz.com',
    tag: 'Bayern, Almanya',
    notes: '2026 Summer | Cybersecurity + secure communications/test & measurement.'
  },

  // Berlin
  {
    company: 'WebID Solutions',
    website: 'https://www.webid-solutions.com',
    tag: 'Berlin, Almanya',
    notes: '2026 Summer | Identity & security-focused fintech.'
  },
  {
    company: 'Adva Network Security',
    website: 'https://www.advasecurity.com',
    tag: 'Berlin, Almanya',
    notes: '2026 Summer | Network security & encryption for critical infrastructure.'
  },

  // Frankfurt
  {
    company: 'Deutsche Börse Group',
    website: 'https://www.deutsche-boerse.com',
    tag: 'Frankfurt, Almanya',
    notes: '2026 Summer | Large-scale systems; security & reliability-focused roles.'
  },

  // Düsseldorf
  {
    company: 'Vodafone GmbH',
    website: 'https://www.vodafone.de',
    tag: 'Düsseldorf, Almanya',
    notes: '2026 Summer | Telecom scale; security/network systems exposure.'
  },
  {
    company: 'ubisys technologies',
    website: 'https://www.ubisys.de',
    tag: 'Düsseldorf, Almanya',
    notes: '2026 Summer | IoT/embedded systems (Zigbee smart home).'
  }
];

const status = 'Researching';
rows.forEach((row) => {
  insert.run(row.company, status, row.notes, row.website, row.tag);
});

const selectAll = db.prepare(`
  SELECT id, company, status, notes, website, tag, created_at, updated_at
  FROM internships
  ORDER BY id DESC
`);

const all = selectAll.all();
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

console.log(`Inserted ${rows.length} rows and updated Excel.`);
