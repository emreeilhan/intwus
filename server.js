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
    fit_score INTEGER DEFAULT 0,
    applied_at TEXT,
    followup_at TEXT,
    priority TEXT DEFAULT 'Medium',
    focus_tags TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);
const columns = db.prepare(`PRAGMA table_info(internships);`).all();
const hasFitScore = columns.some((col) => col.name === 'fit_score');
if (!hasFitScore) {
  db.exec(`ALTER TABLE internships ADD COLUMN fit_score INTEGER DEFAULT 0;`);
}
const hasAppliedAt = columns.some((col) => col.name === 'applied_at');
if (!hasAppliedAt) {
  db.exec(`ALTER TABLE internships ADD COLUMN applied_at TEXT;`);
}
const hasFollowupAt = columns.some((col) => col.name === 'followup_at');
if (!hasFollowupAt) {
  db.exec(`ALTER TABLE internships ADD COLUMN followup_at TEXT;`);
}
const hasPriority = columns.some((col) => col.name === 'priority');
if (!hasPriority) {
  db.exec(`ALTER TABLE internships ADD COLUMN priority TEXT DEFAULT 'Medium';`);
}
const hasFocusTags = columns.some((col) => col.name === 'focus_tags');
if (!hasFocusTags) {
  db.exec(`ALTER TABLE internships ADD COLUMN focus_tags TEXT DEFAULT '';`);
}

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

const selectAll = db.prepare(`
  SELECT id, company, status, notes, website, tag, fit_score, applied_at, followup_at, priority, focus_tags, created_at, updated_at
  FROM internships
  ORDER BY id DESC
`);

const insertOne = db.prepare(`
  INSERT INTO internships (company, status, notes, website, tag, fit_score, applied_at, followup_at, priority, focus_tags, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);

const insertWithId = db.prepare(`
  INSERT INTO internships (id, company, status, notes, website, tag, fit_score, applied_at, followup_at, priority, focus_tags, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateOne = db.prepare(`
  UPDATE internships
  SET company = ?, status = ?, notes = ?, website = ?, tag = ?, fit_score = ?, applied_at = ?, followup_at = ?, priority = ?, focus_tags = ?, updated_at = datetime('now')
  WHERE id = ?
`);

const updateWithTimestamps = db.prepare(`
  UPDATE internships
  SET company = ?, status = ?, notes = ?, website = ?, tag = ?, fit_score = ?, applied_at = ?, followup_at = ?, priority = ?, focus_tags = ?, created_at = ?, updated_at = ?
  WHERE id = ?
`);

const deleteOne = db.prepare(`
  DELETE FROM internships WHERE id = ?
`);

function syncExcel() {
  const rows = selectAll.all();
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
  const body = rows.map((row) => [
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
}

function computeFitScore({ company, status, notes, website, tag }) {
  const text = [company, status, notes, website, tag].join(' ').toLowerCase();
  let score = 1;
  const strong = [
    'embedded', 'firmware', 'microcontroller', 'soc', 'iot', 'rtos',
    'security', 'secure', 'cyber', 'infosec', 'soc', 'threat',
    'automotive', 'industrial', 'ics', 'scada', 'defense', 'hardware'
  ];
  const medium = [
    'systems', 'system', 'low-level', 'kernel', 'device', 'network',
    'telecom', 'semiconductor', 'silicon'
  ];

  const strongHits = strong.filter((k) => text.includes(k)).length;
  const mediumHits = medium.filter((k) => text.includes(k)).length;

  score += Math.min(2, Math.floor(strongHits / 2));
  score += Math.min(1, Math.floor(mediumHits / 2));

  if (text.includes('embedded security')) score += 1;
  if (text.includes('secure systems')) score += 1;

  return Math.max(1, Math.min(5, score));
}

function backfillFitScores() {
  const rows = db.prepare(`SELECT id, company, status, notes, website, tag FROM internships`).all();
  const updateScore = db.prepare(`UPDATE internships SET fit_score = ? WHERE id = ?`);
  rows.forEach((row) => {
    const score = computeFitScore(row);
    updateScore.run(score, row.id);
  });
}

function backfillPriority() {
  db.prepare(`UPDATE internships SET priority = 'Medium' WHERE priority IS NULL OR priority = ''`).run();
}

function syncFromExcel() {
  if (!fs.existsSync(excelPath)) return;
  const workbook = xlsx.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });
  if (!rows.length) return;

  const upsert = db.transaction((items) => {
    items.forEach((item) => {
      const id = Number(item.Id || item.ID || item.id || 0);
      const company = String(item.Company || '').trim();
      if (!company) return;
      const status = String(item.Status || 'Researching').trim();
      const notes = String(item.Notes || '').trim();
      const website = String(item.Website || '').trim();
      const tag = String(item.Tag || '').trim();
      const appliedAt = String(item['Applied At'] || item.AppliedAt || '').trim();
      const followupAt = String(item['Follow-up At'] || item['Followup At'] || item.FollowupAt || '').trim();
      const priority = String(item.Priority || 'Medium').trim() || 'Medium';
      const focusTags = String(item['Focus Tags'] || item.FocusTags || '').trim();
      const fitScore = Number(item['Fit Score'] || item.FitScore || 0) || computeFitScore({
        company,
        status,
        notes,
        website,
        tag
      });
      const createdAt = String(item['Created At'] || item.CreatedAt || '').trim() || new Date().toISOString();
      const updatedAt = String(item['Updated At'] || item.UpdatedAt || '').trim() || new Date().toISOString();

      if (id) {
        const exists = db.prepare('SELECT 1 FROM internships WHERE id = ?').get(id);
        if (exists) {
          updateWithTimestamps.run(
            company,
            status,
            notes,
            website,
            tag,
            fitScore,
            appliedAt || null,
            followupAt || null,
            priority || 'Medium',
            focusTags || '',
            createdAt,
            updatedAt,
            id
          );
        } else {
          insertWithId.run(
            id,
            company,
            status,
            notes,
            website,
            tag,
            fitScore,
            appliedAt || null,
            followupAt || null,
            priority || 'Medium',
            focusTags || '',
            createdAt,
            updatedAt
          );
        }
      } else {
        insertOne.run(
          company,
          status,
          notes,
          website,
          tag,
          fitScore,
          appliedAt || null,
          followupAt || null,
          priority || 'Medium',
          focusTags || ''
        );
      }
    });
  });

  upsert(rows);
}

function excelIsNewer() {
  if (!fs.existsSync(excelPath)) return false;
  if (!fs.existsSync(dbPath)) return true;
  const excelStat = fs.statSync(excelPath);
  const dbStat = fs.statSync(dbPath);
  return excelStat.mtimeMs > dbStat.mtimeMs;
}

app.get('/api/internships', (req, res) => {
  res.json(selectAll.all());
});

app.post('/api/internships', (req, res) => {
  const { company, status, notes, website, tag, applied_at, followup_at, priority, focus_tags } = req.body || {};
  if (!company || typeof company !== 'string') {
    return res.status(400).json({ error: 'Company is required.' });
  }
  const finalStatus = status && typeof status === 'string' ? status : 'Researching';
  const fitScore = computeFitScore({
    company,
    status: finalStatus,
    notes,
    website,
    tag
  });
  const info = insertOne.run(
    company.trim(),
    finalStatus.trim(),
    notes ? String(notes) : '',
    website ? String(website) : '',
    tag ? String(tag) : '',
    fitScore,
    applied_at ? String(applied_at) : null,
    followup_at ? String(followup_at) : null,
    priority ? String(priority) : 'Medium',
    focus_tags ? String(focus_tags) : ''
  );
  syncExcel();
  res.status(201).json({ id: info.lastInsertRowid });
});

app.put('/api/internships/:id', (req, res) => {
  const { id } = req.params;
  const { company, status, notes, website, tag, applied_at, followup_at, priority, focus_tags } = req.body || {};
  if (!company || typeof company !== 'string') {
    return res.status(400).json({ error: 'Company is required.' });
  }
  const finalStatus = status && typeof status === 'string' ? status : 'Researching';
  const fitScore = computeFitScore({
    company,
    status: finalStatus,
    notes,
    website,
    tag
  });
  const info = updateOne.run(
    company.trim(),
    finalStatus.trim(),
    notes ? String(notes) : '',
    website ? String(website) : '',
    tag ? String(tag) : '',
    fitScore,
    applied_at ? String(applied_at) : null,
    followup_at ? String(followup_at) : null,
    priority ? String(priority) : 'Medium',
    focus_tags ? String(focus_tags) : '',
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

app.post('/api/import', (req, res) => {
  if (!fs.existsSync(excelPath)) {
    return res.status(404).json({ error: 'Excel file not found.' });
  }
  syncFromExcel();
  res.json({ ok: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  if (excelIsNewer()) {
    syncFromExcel();
  }
  backfillFitScores();
  backfillPriority();
  syncExcel();
  console.log(`Server running on http://localhost:${port}`);
});
