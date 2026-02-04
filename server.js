import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import xlsx from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const selectAll = db.prepare(`
  SELECT id, company, status, notes, website, tag, created_at, updated_at
  FROM internships
  ORDER BY id DESC
`);

const insertOne = db.prepare(`
  INSERT INTO internships (company, status, notes, website, tag, updated_at)
  VALUES (?, ?, ?, ?, ?, datetime('now'))
`);

const updateOne = db.prepare(`
  UPDATE internships
  SET company = ?, status = ?, notes = ?, website = ?, tag = ?, updated_at = datetime('now')
  WHERE id = ?
`);

const deleteOne = db.prepare(`
  DELETE FROM internships WHERE id = ?
`);

function syncExcel() {
  const rows = selectAll.all();
  const header = [[
    'Company',
    'Status',
    'Notes',
    'Website',
    'Tag',
    'Created At',
    'Updated At'
  ]];
  const body = rows.map((row) => [
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
}

app.get('/api/internships', (req, res) => {
  res.json(selectAll.all());
});

app.post('/api/internships', (req, res) => {
  const { company, status, notes, website, tag } = req.body || {};
  if (!company || typeof company !== 'string') {
    return res.status(400).json({ error: 'Company is required.' });
  }
  const finalStatus = status && typeof status === 'string' ? status : 'Researching';
  const info = insertOne.run(
    company.trim(),
    finalStatus.trim(),
    notes ? String(notes) : '',
    website ? String(website) : '',
    tag ? String(tag) : ''
  );
  syncExcel();
  res.status(201).json({ id: info.lastInsertRowid });
});

app.put('/api/internships/:id', (req, res) => {
  const { id } = req.params;
  const { company, status, notes, website, tag } = req.body || {};
  if (!company || typeof company !== 'string') {
    return res.status(400).json({ error: 'Company is required.' });
  }
  const finalStatus = status && typeof status === 'string' ? status : 'Researching';
  const info = updateOne.run(
    company.trim(),
    finalStatus.trim(),
    notes ? String(notes) : '',
    website ? String(website) : '',
    tag ? String(tag) : '',
    Number(id)
  );
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Not found.' });
  }
  syncExcel();
  res.json({ ok: true });
});

app.delete('/api/internships/:id', (req, res) => {
  const { id } = req.params;
  const info = deleteOne.run(Number(id));
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Not found.' });
  }
  syncExcel();
  res.json({ ok: true });
});

app.get('/api/export', (req, res) => {
  if (!fs.existsSync(excelPath)) {
    syncExcel();
  }
  res.download(excelPath, 'internships.xlsx');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
