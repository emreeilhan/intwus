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

db.exec(`
  CREATE TABLE IF NOT EXISTS saved_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    filters_json TEXT NOT NULL,
    sort_key TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    internship_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

const insertActivity = db.prepare(`
  INSERT INTO activity_log (internship_id, event_type, old_value, new_value, created_at)
  VALUES (?, ?, ?, ?, ?)
`);

const selectActivity = db.prepare(`
  SELECT id, internship_id, event_type, old_value, new_value, created_at
  FROM activity_log
  WHERE internship_id = ?
  ORDER BY id DESC
`);

const selectSavedViews = db.prepare(`
  SELECT id, name, filters_json, sort_key, created_at, updated_at
  FROM saved_views
  ORDER BY name COLLATE NOCASE ASC
`);

const insertSavedView = db.prepare(`
  INSERT INTO saved_views (name, filters_json, sort_key, updated_at)
  VALUES (?, ?, ?, datetime('now'))
`);

const updateSavedView = db.prepare(`
  UPDATE saved_views
  SET name = ?, filters_json = ?, sort_key = ?, updated_at = datetime('now')
  WHERE id = ?
`);

const deleteSavedView = db.prepare(`
  DELETE FROM saved_views WHERE id = ?
`);

function nowIso() {
  return new Date().toISOString();
}

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function serializeValue(value) {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

function addActivity(internshipId, eventType, oldValue, newValue) {
  insertActivity.run(
    internshipId,
    eventType,
    serializeValue(oldValue),
    serializeValue(newValue),
    nowIso()
  );
}

function getInternship(id) {
  return db.prepare(`
    SELECT id, company, status, notes, website, tag, fit_score, applied_at, followup_at, priority, focus_tags, created_at, updated_at
    FROM internships
    WHERE id = ?
  `).get(id);
}

function getBaseChangePayload(row) {
  return {
    company: row.company,
    status: row.status,
    notes: row.notes || '',
    website: row.website || '',
    tag: row.tag || '',
    priority: row.priority || 'Medium',
    applied_at: row.applied_at || '',
    followup_at: row.followup_at || '',
    focus_tags: row.focus_tags || ''
  };
}

function compareFieldChanges(before, after) {
  const changes = {};
  Object.keys(after).forEach((key) => {
    if (String(before?.[key] ?? '') !== String(after?.[key] ?? '')) {
      changes[key] = { before: before?.[key] ?? '', after: after?.[key] ?? '' };
    }
  });
  return changes;
}

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

app.get('/api/internships/:id/activity', (req, res) => {
  const { id } = req.params;
  res.json(selectActivity.all(Number(id)));
});

app.get('/api/saved-views', (req, res) => {
  const rows = selectSavedViews.all().map((row) => ({
    ...row,
    filters: safeJsonParse(row.filters_json, {})
  }));
  res.json(rows);
});

app.post('/api/saved-views', (req, res) => {
  const { name, filters = {}, sort_key = '' } = req.body || {};
  const finalName = String(name || '').trim();
  if (!finalName) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  try {
    const info = insertSavedView.run(finalName, JSON.stringify(filters || {}), String(sort_key || ''));
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (error) {
    if (String(error?.message || '').includes('UNIQUE')) {
      return res.status(409).json({ error: 'Saved view already exists.' });
    }
    throw error;
  }
});

app.put('/api/saved-views/:id', (req, res) => {
  const { id } = req.params;
  const { name, filters = {}, sort_key = '' } = req.body || {};
  const finalName = String(name || '').trim();
  if (!finalName) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  const info = updateSavedView.run(finalName, JSON.stringify(filters || {}), String(sort_key || ''), Number(id));
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Not found.' });
  }
  res.json({ ok: true });
});

app.delete('/api/saved-views/:id', (req, res) => {
  const info = deleteSavedView.run(Number(req.params.id));
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Not found.' });
  }
  res.json({ ok: true });
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
  addActivity(info.lastInsertRowid, 'created', null, getBaseChangePayload({
    company: company.trim(),
    status: finalStatus.trim(),
    notes: notes ? String(notes) : '',
    website: website ? String(website) : '',
    tag: tag ? String(tag) : '',
    priority: priority ? String(priority) : 'Medium',
    applied_at: applied_at ? String(applied_at) : '',
    followup_at: followup_at ? String(followup_at) : '',
    focus_tags: focus_tags ? String(focus_tags) : ''
  }));
  syncExcel();
  res.status(201).json({ id: info.lastInsertRowid });
});

app.put('/api/internships/:id', (req, res) => {
  const { id } = req.params;
  const { company, status, notes, website, tag, applied_at, followup_at, priority, focus_tags } = req.body || {};
  if (!company || typeof company !== 'string') {
    return res.status(400).json({ error: 'Company is required.' });
  }
  const existing = getInternship(Number(id));
  if (!existing) {
    return res.status(404).json({ error: 'Not found.' });
  }
  const finalStatus = status && typeof status === 'string' ? status : 'Researching';
  const nextPayload = {
    company: company.trim(),
    status: finalStatus.trim(),
    notes: notes ? String(notes) : '',
    website: website ? String(website) : '',
    tag: tag ? String(tag) : '',
    priority: priority ? String(priority) : 'Medium',
    applied_at: applied_at ? String(applied_at) : '',
    followup_at: followup_at ? String(followup_at) : '',
    focus_tags: focus_tags ? String(focus_tags) : ''
  };
  const fitScore = computeFitScore({
    company: nextPayload.company,
    status: nextPayload.status,
    notes: nextPayload.notes,
    website: nextPayload.website,
    tag: nextPayload.tag
  });
  const previousPayload = getBaseChangePayload(existing);
  const info = updateOne.run(
    nextPayload.company,
    nextPayload.status,
    nextPayload.notes,
    nextPayload.website,
    nextPayload.tag,
    fitScore,
    nextPayload.applied_at || null,
    nextPayload.followup_at || null,
    nextPayload.priority,
    nextPayload.focus_tags,
    Number(id)
  );
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Not found.' });
  }
  const changes = compareFieldChanges(previousPayload, nextPayload);
  if (Object.keys(changes).length > 0) {
    addActivity(Number(id), 'edited', previousPayload, nextPayload);
    if (changes.status) {
      addActivity(Number(id), 'status changed', previousPayload.status, nextPayload.status);
    }
    if (changes.followup_at) {
      addActivity(Number(id), 'follow-up changed', previousPayload.followup_at, nextPayload.followup_at);
    }
  }
  syncExcel();
  res.json({ ok: true });
});

app.delete('/api/internships/:id', (req, res) => {
  const { id } = req.params;
  const existing = getInternship(Number(id));
  if (!existing) {
    return res.status(404).json({ error: 'Not found.' });
  }
  const info = deleteOne.run(Number(id));
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Not found.' });
  }
  addActivity(Number(id), 'deleted', getBaseChangePayload(existing), null);
  syncExcel();
  res.json({ ok: true });
});

app.post('/api/internships/bulk-update', (req, res) => {
  const { ids = [], status, priority } = req.body || {};
  const idList = Array.isArray(ids) ? ids.map(Number).filter(Boolean) : [];
  if (!idList.length) {
    return res.status(400).json({ error: 'At least one id is required.' });
  }
  const rows = idList.map((id) => getInternship(id)).filter(Boolean);
  if (!rows.length) {
    return res.status(404).json({ error: 'Not found.' });
  }

  const applyUpdate = db.transaction((items) => {
    items.forEach((row) => {
      const next = {
        ...getBaseChangePayload(row),
        status: status ? String(status) : row.status,
        priority: priority ? String(priority) : row.priority || 'Medium'
      };
      const fitScore = computeFitScore({
        company: next.company,
        status: next.status,
        notes: next.notes,
        website: next.website,
        tag: next.tag
      });
      updateOne.run(
        next.company,
        next.status,
        next.notes,
        next.website,
        next.tag,
        fitScore,
        next.applied_at || null,
        next.followup_at || null,
        next.priority,
        next.focus_tags,
        row.id
      );
      addActivity(row.id, 'edited', getBaseChangePayload(row), next);
      if (status && String(row.status) !== String(next.status)) {
        addActivity(row.id, 'status changed', row.status, next.status);
      }
    });
  });

  applyUpdate(rows);
  syncExcel();
  res.json({ ok: true, updated: rows.length });
});

app.post('/api/internships/bulk-delete', (req, res) => {
  const { ids = [] } = req.body || {};
  const idList = Array.isArray(ids) ? ids.map(Number).filter(Boolean) : [];
  if (!idList.length) {
    return res.status(400).json({ error: 'At least one id is required.' });
  }
  const rows = idList.map((id) => getInternship(id)).filter(Boolean);
  if (!rows.length) {
    return res.status(404).json({ error: 'Not found.' });
  }
  const deleteMany = db.transaction((items) => {
    items.forEach((row) => {
      deleteOne.run(row.id);
      addActivity(row.id, 'deleted', getBaseChangePayload(row), null);
    });
  });
  deleteMany(rows);
  syncExcel();
  res.json({ ok: true, deleted: rows.length });
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
