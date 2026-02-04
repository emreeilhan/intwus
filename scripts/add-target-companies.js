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
  // Stuttgart
  {
    company: 'Robert Bosch GmbH',
    website: 'https://www.bosch.com',
    tag: 'Stuttgart, DE',
    notes: '2026 Summer | Embedded systems + security odakli ekipler. Initiative application.'
  },
  {
    company: 'Mercedes-Benz Group AG',
    website: 'https://group.mercedes-benz.com',
    tag: 'Stuttgart, DE',
    notes: '2026 Summer | Otomotiv embedded/vehicle security odakli ekipler. Initiative application.'
  },
  {
    company: 'Porsche AG',
    website: 'https://www.porsche.com',
    tag: 'Stuttgart, DE',
    notes: '2026 Summer | Embedded systems, firmware ve otomotiv guvenligi odakli roller. Initiative application.'
  },
  {
    company: 'ETAS GmbH',
    website: 'https://www.etas.com',
    tag: 'Stuttgart, DE',
    notes: '2026 Summer | Embedded tooling, ECU ve embedded security odakli ekipler.'
  },
  {
    company: 'Vector Informatik',
    website: 'https://www.vector.com',
    tag: 'Stuttgart, DE',
    notes: '2026 Summer | Embedded software tooling, ECU ve sistem guvenligi odakli ekipler.'
  },

  // Bayern
  {
    company: 'Siemens AG',
    website: 'https://www.siemens.com',
    tag: 'Bayern, DE',
    notes: '2026 Summer | Endustriyel sistemler, OT/ICS guvenligi ve embedded odakli ekipler.'
  },
  {
    company: 'BMW Group',
    website: 'https://www.bmwgroup.com',
    tag: 'Bayern, DE',
    notes: '2026 Summer | Otomotiv embedded, sistem guvenligi ve yazilim ekipleri.'
  },
  {
    company: 'Infineon Technologies',
    website: 'https://www.infineon.com',
    tag: 'Bayern, DE',
    notes: '2026 Summer | Semiconductor, embedded security ve hardware-backed systems.'
  },
  {
    company: 'Rohde & Schwarz',
    website: 'https://www.rohde-schwarz.com',
    tag: 'Bayern, DE',
    notes: '2026 Summer | Guvenli haberlesme, test/measurement, cybersecurity ekipleri.'
  },
  {
    company: 'Giesecke+Devrient',
    website: 'https://www.gi-de.com',
    tag: 'Bayern, DE',
    notes: '2026 Summer | SecurityTech, kimlik ve secure hardware/embedded alanlari.'
  },
  {
    company: 'Bosch Rexroth',
    website: 'https://www.boschrexroth.com',
    tag: 'Bayern, DE',
    notes: '2026 Summer | Endustriyel otomasyon, kontrol sistemleri ve embedded guvenlik.'
  },

  // Berlin
  {
    company: 'WebID Solutions',
    website: 'https://webid-solutions.com',
    tag: 'Berlin, DE',
    notes: '2026 Summer | Kimlik dogrulama ve guvenlik odakli sistemler.'
  },
  {
    company: 'Adva Network Security',
    website: 'https://www.advasecurity.com',
    tag: 'Berlin, DE',
    notes: '2026 Summer | Network security, encryption ve kritik altyapi guvenligi.'
  },

  // Frankfurt
  {
    company: 'Deutsche Bank',
    website: 'https://www.db.com',
    tag: 'Frankfurt, DE',
    notes: '2026 Summer | Banka altyapisi ve siber guvenlik odakli ekipler.'
  },
  {
    company: 'Commerzbank',
    website: 'https://www.commerzbank.de',
    tag: 'Frankfurt, DE',
    notes: '2026 Summer | Finansal sistemler ve bilgi guvenligi odakli ekipler.'
  },
  {
    company: 'DekaBank',
    website: 'https://www.deka.de',
    tag: 'Frankfurt, DE',
    notes: '2026 Summer | Finans ve altyapi guvenligi odakli ekipler.'
  },
  {
    company: 'Deutsche Boerse Group',
    website: 'https://www.deutsche-boerse.com',
    tag: 'Frankfurt, DE',
    notes: '2026 Summer | Piyasa altyapisi, cyber protection ve sistem guvenligi odakli ekipler.'
  },
  {
    company: 'DZ BANK',
    website: 'https://www.dzbank.com',
    tag: 'Frankfurt, DE',
    notes: '2026 Summer | Finansal altyapi ve bilgi guvenligi odakli ekipler.'
  },

  // Düsseldorf
  {
    company: 'Vodafone GmbH',
    website: 'https://www.vodafone.de',
    tag: 'Dusseldorf, DE',
    notes: '2026 Summer | Telecom network security ve sistem guvenligi ekipleri.'
  },
  {
    company: 'Henkel',
    website: 'https://www.henkel.com',
    tag: 'Dusseldorf, DE',
    notes: '2026 Summer | Endustriyel IT/OT ve guvenlik odakli ekipler.'
  },
  {
    company: 'Rheinmetall',
    website: 'https://www.rheinmetall.com',
    tag: 'Dusseldorf, DE',
    notes: '2026 Summer | Guvenlik ve savunma teknolojileri, embedded/secure systems.'
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

const updateTags = db.prepare(`
  UPDATE internships
  SET tag = REPLACE(tag, 'Almanya', 'DE'), updated_at = datetime('now')
  WHERE tag LIKE '%Almanya%'
`);

updateTags.run();

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

console.log(`Inserted ${inserted} rows, updated ${updated} rows, standardized tags.`);
