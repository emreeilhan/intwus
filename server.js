import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import nodemailer from 'nodemailer';
import multer from 'multer';
import xlsx from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'internships.db');
const excelPath = path.join(dataDir, 'internships.xlsx');
const profilePath = path.join(dataDir, 'profile.json');

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
    reply_received_at TEXT,
    reply_outcome TEXT DEFAULT '',
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
const hasReplyReceivedAt = columns.some((col) => col.name === 'reply_received_at');
if (!hasReplyReceivedAt) {
  db.exec(`ALTER TABLE internships ADD COLUMN reply_received_at TEXT;`);
}
const hasReplyOutcome = columns.some((col) => col.name === 'reply_outcome');
if (!hasReplyOutcome) {
  db.exec(`ALTER TABLE internships ADD COLUMN reply_outcome TEXT DEFAULT '';`);
}
const hasPriority = columns.some((col) => col.name === 'priority');
if (!hasPriority) {
  db.exec(`ALTER TABLE internships ADD COLUMN priority TEXT DEFAULT 'Medium';`);
}
const hasFocusTags = columns.some((col) => col.name === 'focus_tags');
if (!hasFocusTags) {
  db.exec(`ALTER TABLE internships ADD COLUMN focus_tags TEXT DEFAULT '';`);
}

const PROFILE_SEED = {
  identity: {
    name: 'Emre Ilhan',
    currentStatus: 'Bilgisayar Muhendisligi lisans ogrencisi',
    headline: 'Embedded-heavy security ve sistem seviyesi muhendislik odagi',
    targetMarket: 'Global ve DACH pazari',
    currentFocus: 'Guvenligi muhendislik zihniyetiyle ele alip firmware ve cihaz davranisini anlayan teknik profil.',
    targetRoles: [
      'Embedded Engineer',
      'Embedded Security Engineer',
      'System-Level Engineer',
      'Security Engineer'
    ]
  },
  summary: {
    executive: 'Aday, standart web gelistirme yerine gomulu sistemler, guvenlik ve sistem seviyesinde calisan yazilimlara yoneliyor. Karar acik bir sekilde security + embedded, ancak embedded-heavy eksende kilitlenmis durumda.',
    profile: 'Ogrenme yaklasimi arac odakli degil, prensip odakli. Sistemlerin neden boyle davrandigini anlamaya, log ve telemetri okumaya ve gercek dunya kisitlariyla dusunmeye agirlik veriyor.',
    positioning: 'Kendisini "guvenlige muhendislik zihniyetiyle yaklasan ve firmware/device seviyesinde sistem davranisini anlayan aday" olarak konumluyor.'
  },
  goals: [
    'Turkiye pazarinda hizli ise alinabilirlik, orta vadede AB ve remote opsiyonlari',
    'AI tarafindan kolay degistirilemeyecek bir uzmanlik zemini kurmak',
    'Uzun vadede yuksek maas tavanina sahip teknik roller hedeflemek',
    '1-2 yil boyunca anlamsiz yavas ilerleme riskinden kacinmak',
    'Teknik anlami koruyarak para ve etkiyi birlikte optimize etmek'
  ],
  strengths: [
    'Sistem seviyesinde dusunme egilimi ve mimari merak',
    'C, Java ve Python ile rahat calisabilme',
    'Ag temelleri ve guvenlik operasyonlarina giris seviyesinde pratik maruziyet',
    'ESP32 ve mikrodenetleyici ekosistemine erken temas',
    'Zor teknik konulara karsi yuksek tolerans ve uzun vadeli plan kurabilme'
  ],
  growthAreas: [
    'RTOS mimarileri ve gorev-zamanlama-memori modeli',
    'Embedded Linux ic yapisi',
    'Firmware ve donanim guvenligi portfoy derinligi',
    'Modern C++ veya Rust ile daha fazla uygulamali deneyim',
    'Gercek veriyle calisan sistem gozlemi ve detection projeleri'
  ],
  skills: {
    technical: [
      'C',
      'Java',
      'Python',
      'Networking fundamentals',
      'System behavior analysis',
      'Detection logic',
      'Automation scripting'
    ],
    domains: [
      'Embedded systems',
      'Cybersecurity',
      'Systems engineering',
      'Device logging and telemetry'
    ],
    focusAreas: [
      'Firmware-level thinking',
      'Secure communication and update mechanisms',
      'Device telemetry analysis',
      'Embedded security entegrasyonu',
      'Engineering-leaning security roles'
    ]
  },
  languages: [
    'English - teknik dokumantasyon ve akademik kaynak kullaniminda aktif',
    'German (B1) - teknik Almanca okuma ve mesleki kullanim motivasyonu yuksek',
    'Turkish - ana iletisim dili'
  ],
  application: {
    senderName: 'Emre Ilhan',
    senderEmail: 'emreilhn15@gmail.com',
    emailSignature: [
      'Best regards,',
      'Emre Ilhan',
      'emreilhn15@gmail.com',
      'github.com/emreeilhan'
    ],
    resumePath: '',
    transcriptPath: '',
    cc: '',
    portfolioUrl: 'https://emreilhan.pages.dev'
  },
  strategy: {
    thesis: 'Security ve Embedded, ancak net bicimde embedded-heavy strateji. Ne saf SOC ne de saf embedded; kontrollu iki eksenli ama ana kimligi belli bir yonelim.',
    primaryAxis: 'Kisa vadeli gelir ve ise giris ekseni engineering-leaning cybersecurity. SOC sadece giris mekanizmasi; alert triage-only rol hedef degil.',
    secondaryAxis: 'Uzun vadeli fark yaratma ekseni aktif sekilde gelistirilen embedded systems. Hobi gibi degil, ciddi ikinci eksen olarak surduruluyor.',
    integrationPoint: 'Asil fark yaratan kisim embedded cihazlardan gelen log ve telemetriyi guvenlik zihniyetiyle yorumlayabilmek; yani embedded ile security hatlarini birlestirmek.',
    rationale: 'Bu strateji dusuk seviyeli SOC AI riskinden kaciyor, junior embedded-only giris surtunmesini azaltyor ve gelecekte security engineer, detection engineer, embedded security gibi cikis opsiyonlarini acik tutuyor.',
    identityStatement: 'I approach security with an engineering mindset and understand how systems behave at the firmware and device level.'
  },
  nonGoals: [
    'Uzun sure SOC L1/L2 benzeri alert-triage rollerinde kalmak',
    'Saf pentest veya red team odakli bir yol izlemek',
    'Guvenlik boyutu olmayan saf driver-maintenance kariyeri',
    'Sertifika toplayip uretim seviyesi beceri olusturmamak',
    'Gec ise alinabilirlik pahasina yalnizca embedded-first gitmek'
  ],
  sources: [
    {
      id: '1LQGH6kGB5D9fzDZBe-7I-kuocq43PNXN',
      title: 'Whoami.pdf',
      kind: 'pdf',
      url: 'https://drive.google.com/file/d/1LQGH6kGB5D9fzDZBe-7I-kuocq43PNXN/view',
      createdTime: '2026-02-14T01:33:03.682Z',
      modifiedTime: '2026-02-14T01:33:13.145Z',
      excerpt: 'Teknik yonelimi, ogrenme sekli ve kariyer hedefleri uzerine daha resmi bir profil dokumani. Embedded, system-level ve embedded security cizgisini; avantajlar, riskler ve SWOT analiziyle birlikte ozetliyor.',
      rawContent: 'This document describes the user\'s technical orientation, learning style, and interaction preferences. It is intended to help AI systems provide more accurate, relevant, and realistic guidance. Teknik profil; mevcut durum, executive summary, teknik yetkinlik analizi, kariyer yonelimi, SWOT ve genel durum ozeti bolumlerinden olusuyor.'
    },
    {
      id: '1Aot2bG1s3yqaIit_OaHjOIVz_w4VstFByPNf_w60VYE',
      title: 'LegacyWhoami',
      kind: 'doc',
      url: 'https://docs.google.com/document/d/1Aot2bG1s3yqaIit_OaHjOIVz_w4VstFByPNf_w60VYE/edit',
      createdTime: '2026-01-21T20:21:53.058Z',
      modifiedTime: '2026-03-18T12:28:01.683Z',
      excerpt: 'Finalized career decision metni. Security + Embedded ama embedded-heavy stratejisini, neden secildigini, entegrasyon noktasini ve acikca reddedilen yollari anlatiyor.',
      rawContent: 'You are a senior technical career advisor. This context describes a FINALIZED career decision, not an open-ended debate. Final decision: Security and Embedded but EMBEDDED-HEAVY. SOC sadece giris mekanizmasi; embedded ise aktif tutulan ikinci eksen. Ana fark yaratici nokta device loglari, telemetry ve anomaly mantigini birlestirmek.'
    }
  ],
  updatedAt: '2026-03-27T00:00:00.000Z'
};

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Purpose: accept .xlsx uploads for /api/import (field name: file)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const nameOk = /\.(xlsx|xls)$/i.test(file.originalname || '');
    const mimeOk =
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'application/octet-stream';
    cb(null, nameOk || mimeOk);
  }
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/api-key', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'api-key.html'));
});

app.get('/agent-review', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'agent-review.html'));
});

app.get('/apikey', (req, res) => {
  res.redirect(302, '/api-key');
});

const selectAll = db.prepare(`
  SELECT id, company, status, notes, website, tag, fit_score, applied_at, followup_at, reply_received_at, reply_outcome, priority, focus_tags, created_at, updated_at
  FROM internships
  ORDER BY id DESC
`);

const insertOne = db.prepare(`
  INSERT INTO internships (company, status, notes, website, tag, fit_score, applied_at, followup_at, reply_received_at, reply_outcome, priority, focus_tags, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);

const insertWithId = db.prepare(`
  INSERT INTO internships (id, company, status, notes, website, tag, fit_score, applied_at, followup_at, reply_received_at, reply_outcome, priority, focus_tags, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateOne = db.prepare(`
  UPDATE internships
  SET company = ?, status = ?, notes = ?, website = ?, tag = ?, fit_score = ?, applied_at = ?, followup_at = ?, reply_received_at = ?, reply_outcome = ?, priority = ?, focus_tags = ?, updated_at = datetime('now')
  WHERE id = ?
`);

const updateWithTimestamps = db.prepare(`
  UPDATE internships
  SET company = ?, status = ?, notes = ?, website = ?, tag = ?, fit_score = ?, applied_at = ?, followup_at = ?, reply_received_at = ?, reply_outcome = ?, priority = ?, focus_tags = ?, created_at = ?, updated_at = ?
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

  CREATE TABLE IF NOT EXISTS application_mail_drafts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    internship_id INTEGER NOT NULL,
    company TEXT NOT NULL,
    to_email TEXT DEFAULT '',
    cc_email TEXT DEFAULT '',
    subject TEXT DEFAULT '',
    body TEXT DEFAULT '',
    tone_preset TEXT DEFAULT 'balanced',
    confidence TEXT DEFAULT 'low',
    hook_type TEXT DEFAULT 'general',
    contact_reason TEXT DEFAULT '',
    status TEXT DEFAULT 'draft',
    draft_json TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
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

const selectAllActivity = db.prepare(`
  SELECT id, internship_id, event_type, old_value, new_value, created_at
  FROM activity_log
  ORDER BY id DESC
`);

const insertMailDraft = db.prepare(`
  INSERT INTO application_mail_drafts (
    internship_id, company, to_email, cc_email, subject, body, tone_preset,
    confidence, hook_type, contact_reason, status, draft_json, updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);

const updateMailDraft = db.prepare(`
  UPDATE application_mail_drafts
  SET
    to_email = ?,
    cc_email = ?,
    subject = ?,
    body = ?,
    tone_preset = ?,
    confidence = ?,
    hook_type = ?,
    contact_reason = ?,
    status = ?,
    draft_json = ?,
    updated_at = datetime('now')
  WHERE id = ?
`);

const selectMailDraftsByInternship = db.prepare(`
  SELECT id, internship_id, company, to_email, cc_email, subject, body, tone_preset, confidence,
         hook_type, contact_reason, status, draft_json, created_at, updated_at
  FROM application_mail_drafts
  WHERE internship_id = ?
  ORDER BY id DESC
`);

const selectMailDraftById = db.prepare(`
  SELECT id, internship_id, company, to_email, cc_email, subject, body, tone_preset, confidence,
         hook_type, contact_reason, status, draft_json, created_at, updated_at
  FROM application_mail_drafts
  WHERE id = ?
`);

const selectMailDraftCountByInternship = db.prepare(`
  SELECT COUNT(*) AS count
  FROM application_mail_drafts
  WHERE internship_id = ?
`);

const deleteMailDraft = db.prepare(`
  DELETE FROM application_mail_drafts
  WHERE id = ?
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

function cloneProfileSeed() {
  return JSON.parse(JSON.stringify(PROFILE_SEED));
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

function createMailDraftRecord({ internshipId, company, draft, status = 'draft' }) {
  const payload = draft && typeof draft === 'object' ? { ...draft } : {};
  const versionNumber = Number(payload.versionNumber || 0) || (Number(selectMailDraftCountByInternship.get(Number(internshipId) || 0)?.count || 0) + 1);
  payload.versionNumber = versionNumber;
  payload.versionLabel = normalizeString(payload.versionLabel, `v${versionNumber}`);
  const info = insertMailDraft.run(
    internshipId,
    normalizeString(company, normalizeString(payload.companyName)),
    normalizeString(payload.contactEmail),
    normalizeString(payload.cc),
    normalizeString(payload.subject),
    typeof payload.body === 'string' ? payload.body : '',
    normalizeString(payload.tonePreset, 'balanced'),
    normalizeString(payload.confidence, 'low'),
    normalizeString(payload.hookType, 'general'),
    normalizeString(payload.contactReason),
    normalizeString(status, 'draft'),
    JSON.stringify(payload)
  );
  return Number(info.lastInsertRowid);
}

function updateMailDraftRecord({ draftId, draft, status }) {
  const existing = selectMailDraftById.get(Number(draftId));
  if (!existing) return false;
  const previousPayload = safeJsonParse(existing.draft_json, {});
  const payload = draft && typeof draft === 'object'
    ? { ...previousPayload, ...draft }
    : previousPayload;
  if (!payload.versionNumber && previousPayload.versionNumber) payload.versionNumber = previousPayload.versionNumber;
  if (!payload.versionLabel && previousPayload.versionLabel) payload.versionLabel = previousPayload.versionLabel;
  updateMailDraft.run(
    normalizeString(payload.contactEmail),
    normalizeString(payload.cc),
    normalizeString(payload.subject),
    typeof payload.body === 'string' ? payload.body : '',
    normalizeString(payload.tonePreset, 'balanced'),
    normalizeString(payload.confidence, 'low'),
    normalizeString(payload.hookType, 'general'),
    normalizeString(payload.contactReason),
    normalizeString(status, normalizeString(existing.status, 'draft')),
    JSON.stringify(payload),
    Number(draftId)
  );
  return true;
}

function formatMailDraftRow(row) {
  const payload = safeJsonParse(row?.draft_json, {});
  return {
    id: Number(row?.id || 0),
    internshipId: Number(row?.internship_id || 0),
    company: normalizeString(row?.company),
    to: normalizeString(row?.to_email),
    cc: normalizeString(row?.cc_email),
    subject: normalizeString(row?.subject),
    body: typeof row?.body === 'string' ? row.body : '',
    tonePreset: normalizeString(row?.tone_preset, 'balanced'),
    confidence: normalizeString(row?.confidence, 'low'),
    hookType: normalizeString(row?.hook_type, 'general'),
    contactReason: normalizeString(row?.contact_reason),
    status: normalizeString(row?.status, 'draft'),
    createdAt: normalizeString(row?.created_at),
    updatedAt: normalizeString(row?.updated_at),
    versionNumber: Number(payload?.versionNumber || 0) || null,
    versionLabel: normalizeString(payload?.versionLabel),
    draft: payload && typeof payload === 'object' ? payload : {}
  };
}

function getInternship(id) {
  return db.prepare(`
    SELECT id, company, status, notes, website, tag, fit_score, applied_at, followup_at, reply_received_at, reply_outcome, priority, focus_tags, created_at, updated_at
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
    fit_score: row.fit_score ?? 0,
    priority: row.priority || 'Medium',
    applied_at: row.applied_at || '',
    followup_at: row.followup_at || '',
    reply_received_at: row.reply_received_at || '',
    reply_outcome: row.reply_outcome || '',
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

function normalizeString(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function normalizeFitScoreInput(value, fallback = null) {
  if (value == null || value === '') return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) return fallback;
  const rounded = Math.round(next);
  if (rounded < 1 || rounded > 5) return fallback;
  return rounded;
}

function normalizeStringList(value, fallback = []) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || '').trim())
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return Array.isArray(fallback) ? [...fallback] : [];
}

function normalizeSourceList(value, fallback = []) {
  const sourceList = Array.isArray(value) ? value : fallback;
  return sourceList
    .map((item) => ({
      id: normalizeString(item?.id),
      title: normalizeString(item?.title),
      kind: normalizeString(item?.kind),
      url: normalizeString(item?.url),
      createdTime: normalizeString(item?.createdTime),
      modifiedTime: normalizeString(item?.modifiedTime),
      excerpt: normalizeString(item?.excerpt),
      rawContent: typeof item?.rawContent === 'string' ? item.rawContent.trim() : ''
    }))
    .filter((item) => item.title || item.url || item.rawContent);
}

function clipText(value, maxLength = 320) {
  const text = normalizeString(value);
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
}

function normalizeProfileInput(input, fallback = PROFILE_SEED) {
  const source = input && typeof input === 'object' ? input : {};
  const identityFallback = fallback.identity || {};
  const summaryFallback = fallback.summary || {};
  const skillsFallback = fallback.skills || {};
  const applicationFallback = fallback.application || {};
  const strategyFallback = fallback.strategy || {};

  return {
    identity: {
      name: normalizeString(source.identity?.name, identityFallback.name || ''),
      currentStatus: normalizeString(source.identity?.currentStatus, identityFallback.currentStatus || ''),
      headline: normalizeString(source.identity?.headline, identityFallback.headline || ''),
      targetMarket: normalizeString(source.identity?.targetMarket, identityFallback.targetMarket || ''),
      currentFocus: normalizeString(source.identity?.currentFocus, identityFallback.currentFocus || ''),
      targetRoles: normalizeStringList(source.identity?.targetRoles, identityFallback.targetRoles || [])
    },
    summary: {
      executive: normalizeString(source.summary?.executive, summaryFallback.executive || ''),
      profile: normalizeString(source.summary?.profile, summaryFallback.profile || ''),
      positioning: normalizeString(source.summary?.positioning, summaryFallback.positioning || '')
    },
    goals: normalizeStringList(source.goals, fallback.goals || []),
    strengths: normalizeStringList(source.strengths, fallback.strengths || []),
    growthAreas: normalizeStringList(source.growthAreas, fallback.growthAreas || []),
    skills: {
      technical: normalizeStringList(source.skills?.technical, skillsFallback.technical || []),
      domains: normalizeStringList(source.skills?.domains, skillsFallback.domains || []),
      focusAreas: normalizeStringList(source.skills?.focusAreas, skillsFallback.focusAreas || [])
    },
    languages: normalizeStringList(source.languages, fallback.languages || []),
    application: {
      senderName: normalizeString(source.application?.senderName, applicationFallback.senderName || ''),
      senderEmail: normalizeString(source.application?.senderEmail, applicationFallback.senderEmail || ''),
      emailSignature: normalizeStringList(source.application?.emailSignature, applicationFallback.emailSignature || []),
      resumePath: normalizeString(source.application?.resumePath, applicationFallback.resumePath || ''),
      transcriptPath: normalizeString(source.application?.transcriptPath, applicationFallback.transcriptPath || ''),
      cc: normalizeString(source.application?.cc, applicationFallback.cc || ''),
      portfolioUrl: normalizeString(source.application?.portfolioUrl, applicationFallback.portfolioUrl || '')
    },
    strategy: {
      thesis: normalizeString(source.strategy?.thesis, strategyFallback.thesis || ''),
      primaryAxis: normalizeString(source.strategy?.primaryAxis, strategyFallback.primaryAxis || ''),
      secondaryAxis: normalizeString(source.strategy?.secondaryAxis, strategyFallback.secondaryAxis || ''),
      integrationPoint: normalizeString(source.strategy?.integrationPoint, strategyFallback.integrationPoint || ''),
      rationale: normalizeString(source.strategy?.rationale, strategyFallback.rationale || ''),
      identityStatement: normalizeString(source.strategy?.identityStatement, strategyFallback.identityStatement || '')
    },
    nonGoals: normalizeStringList(source.nonGoals, fallback.nonGoals || []),
    sources: normalizeSourceList(source.sources, fallback.sources || []),
    updatedAt: normalizeString(source.updatedAt, fallback.updatedAt || nowIso())
  };
}

let profileCache = null;
let profileWriteLock = Promise.resolve();

async function ensureProfileFile() {
  try {
    await fs.promises.access(profilePath);
  } catch {
    await fs.promises.writeFile(profilePath, JSON.stringify(cloneProfileSeed(), null, 2));
  }
}

async function readProfile() {
  if (profileCache) return profileCache;
  await ensureProfileFile();
  const raw = await fs.promises.readFile(profilePath, 'utf8');
  const parsed = safeJsonParse(raw, null);
  if (!parsed) {
    const fallback = normalizeProfileInput(cloneProfileSeed(), PROFILE_SEED);
    await fs.promises.writeFile(profilePath, JSON.stringify(fallback, null, 2));
    profileCache = fallback;
    return fallback;
  }
  profileCache = normalizeProfileInput(parsed, PROFILE_SEED);
  return profileCache;
}

async function writeProfile(profile) {
  // Use a promise to track the result of the current operation
  let resolveOp, rejectOp;
  const opPromise = new Promise((res, rej) => {
    resolveOp = res;
    rejectOp = rej;
  });

  profileWriteLock = profileWriteLock.then(async () => {
    try {
      // Re-read inside the lock to prevent lost updates
      const current = profileCache || await readProfile();
      const normalized = normalizeProfileInput(profile, current);
      normalized.updatedAt = nowIso();
      await fs.promises.writeFile(profilePath, JSON.stringify(normalized, null, 2));
      profileCache = normalized;
      resolveOp(normalized);
    } catch (e) {
      rejectOp(e);
    }
  }).catch(() => {
    // Prevent broken chain
  });

  return opPromise;
}

function pickProfileSummary(profile) {
  return {
    name: profile.identity?.name || '',
    currentStatus: profile.identity?.currentStatus || '',
    headline: profile.identity?.headline || '',
    currentFocus: profile.identity?.currentFocus || '',
    targetRoles: normalizeStringList(profile.identity?.targetRoles || []).slice(0, 4),
    backgroundSummary: clipText(profile.summary?.profile || profile.summary?.executive, 400),
    projects: normalizeStringList(profile.projects || []).slice(0, 4),
    achievements: normalizeStringList(profile.achievements || []).slice(0, 5),
    certifications: normalizeStringList(profile.certifications || []).slice(0, 3),
    coursework: normalizeStringList(profile.coursework || []).slice(0, 6),
    goals: normalizeStringList(profile.goals || []).slice(0, 3),
    strengths: normalizeStringList(profile.strengths || []).slice(0, 4),
    growthAreas: normalizeStringList(profile.growthAreas || []).slice(0, 3),
    technicalSkills: normalizeStringList(profile.skills?.technical || []).slice(0, 8),
    domainSkills: normalizeStringList(profile.skills?.domains || []).slice(0, 5),
    focusAreas: normalizeStringList(profile.skills?.focusAreas || []).slice(0, 4),
    languages: normalizeStringList(profile.languages || []).slice(0, 3),
    portfolioUrl: profile.application?.portfolioUrl || ''
  };
}

function resolveAttachment(pathValue) {
  const value = normalizeString(pathValue);
  if (!value) return { path: '', exists: false, name: '', error: 'Missing path' };
  const absolutePath = path.isAbsolute(value) ? value : path.join(process.cwd(), value);
  const exists = fs.existsSync(absolutePath);
  return {
    path: absolutePath,
    exists,
    name: path.basename(absolutePath),
    error: exists ? '' : 'File not found'
  };
}

function getApplicationAssets(profile) {
  const resume = resolveAttachment(profile.application?.resumePath);
  const transcript = resolveAttachment(profile.application?.transcriptPath);
  return { resume, transcript };
}

function getSmtpConfig() {
  const host = normalizeString(process.env.SMTP_HOST);
  const port = Number(process.env.SMTP_PORT || 0) || 587;
  const user = normalizeString(process.env.SMTP_USER);
  const pass = normalizeString(process.env.SMTP_PASS);
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port,
    secure,
    auth: { user, pass }
  };
}

function buildDraftBody({ introLines, bodyLines, signatureLines }) {
  return [
    ...(introLines || []),
    '',
    ...(bodyLines || []),
    '',
    ...(signatureLines || [])
  ]
    .map((line) => String(line || '').trimEnd())
    .join('\n')
    .trim();
}

let syncExcelTimeout = null;

function syncExcel() {
  if (syncExcelTimeout) {
    clearTimeout(syncExcelTimeout);
  }
  syncExcelTimeout = setTimeout(() => {
    syncExcelTimeout = null;
    try {
      performSyncExcel();
    } catch (err) {
      console.error('Failed to sync Excel:', err);
    }
  }, 1000);
}

function performSyncExcel() {
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
    'Reply Received At',
    'Reply Outcome',
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
    row.reply_received_at || '',
    row.reply_outcome || '',
    row.priority || 'Medium',
    row.focus_tags || '',
    row.created_at,
    row.updated_at
  ]);
  const worksheet = xlsx.utils.aoa_to_sheet([...header, ...body]);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Internships');
  xlsx.writeFileAsync(excelPath, workbook, (err) => {
    if (err) {
      console.error('Error writing Excel file:', err);
    }
  });
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
  const rows = db.prepare(`
    SELECT id, company, status, notes, website, tag
    FROM internships
    WHERE fit_score IS NULL OR fit_score = 0
  `).all();
  const updateScore = db.prepare(`UPDATE internships SET fit_score = ? WHERE id = ?`);
  rows.forEach((row) => {
    const score = computeFitScore(row);
    updateScore.run(score, row.id);
  });
}

function backfillPriority() {
  db.prepare(`UPDATE internships SET priority = 'Medium' WHERE priority IS NULL OR priority = ''`).run();
}

function collectOpenAIContent(response) {
  const blocks = Array.isArray(response?.output) ? response.output : [];
  const textParts = [];
  const sources = [];

  blocks.forEach((block) => {
    if (block?.type === 'message') {
      const items = Array.isArray(block.content) ? block.content : [];
      items.forEach((item) => {
        if (item?.type === 'output_text' && typeof item.text === 'string' && item.text.trim()) {
          textParts.push(item.text.trim());
        }
        if (Array.isArray(item?.annotations)) {
          item.annotations.forEach((annotation) => {
            if (annotation?.type === 'url_citation' && annotation.url) {
              sources.push({
                url: annotation.url,
                title: annotation.title || annotation.url,
                cited_text: '',
                page_age: ''
              });
            }
          });
        }
      });
      return;
    }

    if (block?.type === 'web_search_call') {
      const callSources = Array.isArray(block?.action?.sources) ? block.action.sources : [];
      callSources.forEach((source) => {
        if (source?.url) {
          sources.push({
            url: source.url,
            title: source.title || source.url,
            cited_text: '',
            page_age: ''
          });
        }
      });
    }
  });

  const uniqueSources = Array.from(new Map(
    sources
      .filter((item) => item?.url)
      .map((item) => [item.url, {
        url: item.url,
        title: item.title || item.url,
        cited_text: item.cited_text || '',
        page_age: item.page_age || ''
      }])
  ).values());

  return {
    rawText: textParts.join('\n\n').trim(),
    sources: uniqueSources
  };
}

function parseAnalysisSections(rawText) {
  const sections = {
    match: [],
    gap: [],
    cvEdit: [],
    mailHook: [],
    verdict: []
  };
  const labels = {
    MATCH: 'match',
    GAP: 'gap',
    'CV EDIT': 'cvEdit',
    'MAIL HOOK': 'mailHook',
    VERDICT: 'verdict'
  };
  let current = null;

  String(rawText || '')
    .replace(/\r/g, '')
    .split('\n')
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const normalizedHeader = trimmed
        .replace(/^[#*\s]+/, '')
        .replace(/\*\*/g, '')
        .replace(/:$/, '')
        .trim()
        .toUpperCase();

      if (labels[normalizedHeader]) {
        current = labels[normalizedHeader];
        return;
      }

      if (!current) return;
      sections[current].push(trimmed.replace(/^[-*•]\s*/, '').trim());
    });

  return sections;
}

function extractVerdictScore(verdictItems, rawText) {
  const verdictText = [...(verdictItems || []), rawText || ''].join(' ');
  const exactMatch = verdictText.match(/([1-5])\s*\/\s*5/);
  if (exactMatch) return Number(exactMatch[1]);
  const fitMatch = verdictText.match(/\bfit\b[^0-9]*([1-5])\b/i);
  if (fitMatch) return Number(fitMatch[1]);
  return null;
}

const ANALYZE_SYSTEM_PROMPT = "You are an expert internship advisor. You will research a company and compare their requirements against a candidate's CV to give specific, actionable advice.";

const APPLICATION_AGENT_SYSTEM_PROMPT = [
  'You are a precision outreach researcher for internship applications.',
  'Your job is to research a company and find a genuine connection between the candidate\'s background and what the company actually works on — not their tagline, not a fabricated hook.',
  'If a real specific hook exists (named team, project, paper, technical area), use it plainly. If not, do not force one.',
  'A clean honest email with hookType: general is always better than a broken or invented specific hook.',
  'Use web search to find: the most relevant team or project area; a credible direct contact path; and real technical signals.',
  'Research quality matters more than writing style. Gather facts and contact paths; do not sound polished, literary, or strategic.',
  'The candidate is early-career. Favor modest, earned claims over strong self-positioning.',
  'Never invent facts. If a detail is uncertain, flag it in warnings instead of stating it as true.',
  'Return plain text only with the exact headers from the user prompt. No markdown code fences.'
].join(' ');

const POLISH_MAIL_SYSTEM_PROMPT = [
  'You are writing a short internship outreach email that should read like a smart real person wrote it in one pass.',
  'Your job is to make the email specific and credible without sounding polished for the sake of sounding polished.',
  'Slightly plain is better than slightly impressive.',
  '',
  'Rules:',
  '1. Write like an engineer or student, not like a brand strategist, copywriter, or consultant.',
  '2. If the draft has a genuine specific hook (named team, project, paper), use it plainly. If the draft hookType is general, do not invent specificity — open with a direct honest sentence instead. A plain opener is better than a forced one.',
  '2b. Do not explain the company back to them in an evaluative voice. Name the team, project, or technical area directly instead of summarizing why it is special. If no hook exists, just say what the candidate works on and what they are looking for.',
  '3. Prefer simple concrete sentences over abstract framing. If a sentence sounds performative, impressive, or too self-aware, simplify it.',
  '4. Show background through one or two concrete focus statements. Do not stack abstractions or long concept chains like "telemetry, communication paths, and update flows" unless they are clearly necessary.',
  '5. Do not force a rhetorical structure like "why this person, why this company, why now" if it makes the mail sound artificial. Natural and direct beats clever.',
  '6. The closing ask should be short and normal. Avoid overly polished lines like "I\'d welcome a short conversation about whether there\'s a fit" unless nothing more natural fits.',
  '7. Remove filler: "for context", "as well", "I would like to", "I am interested in", "I am reaching out because", "that overlap is why I am writing".',
  '8. Total content: 4–6 short paragraphs or sentences maximum. The whole email including greeting and signature must fit in one screen.',
  '9. Mention attached resume and transcript in one brief natural sentence only if relevant.',
  '10. If a portfolio link is included, mention it plainly as supporting material, not as a marketing line.',
  '11. Never invent achievements or facts not in the profile or draft.',
  '12. Optimize for "sounds believable and human" over "sounds impressive".',
  '13. Avoid praise-heavy or self-promotional patterns such as "exactly the kind of environment I want to grow in", "my work and studies have pushed me toward", "that focus is why I am writing to you specifically", or "your work stands out for".',
  '14. Avoid meta lines that explain the psychology of the email. Just say the relevant fact, your background, and the ask.',
  '15. Write like a capable but junior candidate. Curious, technically grounded, and respectful is right; self-congratulatory, high-status, or unusually senior is wrong.',
  'Return strict JSON only.'
].join('\n');

const OPENAI_RESEARCH_MODEL = 'gpt-5.4-mini';
const OPENAI_POLISH_MODEL = 'gpt-5.4';

async function callOpenAIResponses({
  apiKey,
  model,
  instructions,
  input,
  maxOutputTokens,
  tools,
  textFormat,
  reasoningEffort,
  include
}) {
  const hasWebSearchTool = Array.isArray(tools) && tools.some((tool) => {
    const type = normalizeString(tool?.type);
    return type === 'web_search' || type === 'web_search_preview' || type === 'web_search_2025_08_26';
  });
  // OpenAI rejects web search with minimal reasoning, so step up one notch for compatible calls.
  const effectiveReasoningEffort = hasWebSearchTool && reasoningEffort === 'minimal' ? 'low' : reasoningEffort;
  // Web search responses cannot use JSON mode, so rely on prompt-level JSON shaping for those calls.
  const effectiveTextFormat = hasWebSearchTool && textFormat?.type === 'json_object' ? null : textFormat;
  const body = {
    model,
    instructions,
    input,
    store: false
  };

  if (Number.isFinite(maxOutputTokens)) {
    body.max_output_tokens = maxOutputTokens;
  }
  if (Array.isArray(tools) && tools.length) {
    body.tools = tools;
  }
  if (effectiveTextFormat) {
    body.text = { format: effectiveTextFormat };
  }
  if (effectiveReasoningEffort) {
    body.reasoning = { effort: effectiveReasoningEffort };
  }
  if (Array.isArray(include) && include.length) {
    body.include = include;
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.error || 'OpenAI request failed.');
  }
  return payload;
}

async function* streamOpenAIResponses({
  apiKey,
  model,
  instructions,
  input,
  maxOutputTokens,
  tools,
  textFormat,
  reasoningEffort,
  include
}) {
  const hasWebSearchTool = Array.isArray(tools) && tools.some((tool) => {
    const type = normalizeString(tool?.type);
    return type === 'web_search' || type === 'web_search_preview' || type === 'web_search_2025_08_26';
  });
  const effectiveReasoningEffort = hasWebSearchTool && reasoningEffort === 'minimal' ? 'low' : reasoningEffort;
  const effectiveTextFormat = hasWebSearchTool && textFormat?.type === 'json_object' ? null : textFormat;

  const body = {
    model,
    instructions,
    input,
    store: false,
    stream: true
  };
  if (Number.isFinite(maxOutputTokens)) body.max_output_tokens = maxOutputTokens;
  if (Array.isArray(tools) && tools.length) body.tools = tools;
  if (effectiveTextFormat) body.text = { format: effectiveTextFormat };
  if (effectiveReasoningEffort) body.reasoning = { effort: effectiveReasoningEffort };
  if (Array.isArray(include) && include.length) body.include = include;

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errPayload = await response.json().catch(() => ({}));
    throw new Error(errPayload?.error?.message || errPayload?.error || 'OpenAI stream request failed.');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed || trimmed === '[DONE]') continue;
      const eventLineMatch = trimmed.match(/^event:\s*(.+)$/m);
      const dataLineMatch = trimmed.match(/^data:\s*(.+)$/m);
      if (!dataLineMatch) continue;
      const rawData = dataLineMatch[1].trim();
      if (rawData === '[DONE]') continue;
      let data;
      try {
        data = JSON.parse(rawData);
      } catch {
        continue;
      }
      const type = eventLineMatch ? eventLineMatch[1].trim() : (data?.type || 'unknown');
      yield { type, data };
    }
  }
  // flush remaining buffer
  const remaining = buffer.trim();
  if (remaining && remaining !== '[DONE]') {
    const eventLineMatch = remaining.match(/^event:\s*(.+)$/m);
    const dataLineMatch = remaining.match(/^data:\s*(.+)$/m);
    if (dataLineMatch) {
      const rawData = dataLineMatch[1].trim();
      if (rawData && rawData !== '[DONE]') {
        try {
          const data = JSON.parse(rawData);
          const type = eventLineMatch ? eventLineMatch[1].trim() : (data?.type || 'unknown');
          yield { type, data };
        } catch { /* ignore */ }
      }
    }
  }
}

function buildAnalyzeUserPrompt({ company, location, notes, cvText }) {
  return [
    `Company: ${company || '-'}`,
    `Location: ${location || '-'}`,
    `Notes: ${notes || '-'}`,
    '',
    "Task: Using web search, find this company's current internship or student positions related to embedded security, hardware security, firmware, or cybersecurity. Then:",
    '',
    '1. MATCH: List 3-5 skills/keywords from my CV that align with what they look for',
    '2. GAP: List 3-5 skills or keywords they want that are missing or weak in my CV',
    '3. CV EDIT: Suggest 2-3 specific, exact wording changes to my CV for this application',
    "4. MAIL HOOK: Write 2-3 simple sentences I can use as the opening of my initiative application email — specific to this company's research/work, not generic, and not flattering or grand",
    '5. VERDICT: Rate fit 1-5 and explain in one sentence',
    '',
    'My CV:',
    cvText || '-',
    '',
    'Be concise. Use bullet points. No fluff. Plain English only.',
    'Use these exact section headers and only bullet points under each:',
    'MATCH:',
    'GAP:',
    'CV EDIT:',
    'MAIL HOOK:',
    'VERDICT:',
    'For VERDICT, use the format: - Fit: N/5 - reason'
  ].join('\n');
}

function buildApplicationAgentPrompt({ company, location, notes, website, profile }) {
  return [
    'Return plain text using these exact headers and bullet/list rules:',
    'COMPANY_NAME:',
    'COMPANY_WEBSITE:',
    'CAREERS_URL:',
    'CONTACT_EMAIL:',
    'CONTACT_REASON:',
    'CONFIDENCE:',
    'SUBJECT:',
    'HOOK_TYPE:',
    'INTRO_LINES:',
    '- one bullet per line',
    'BODY_LINES:',
    '- one bullet per line',
    'COMPANY_SIGNALS:',
    '- one bullet per line',
    'PERSONAL_ANGLES:',
    '- one bullet per line',
    'WARNINGS:',
    '- one bullet per line',
    'RECOMMENDED_ATTACHMENTS:',
    '- resume: true|false',
    '- transcript: true|false',
    '- portfolioLink: true|false',
    'COMBINATION_LABEL:',
    'RATIONALE:',
    '',
    `Target company: ${company || '-'}`,
    `Location hint: ${location || '-'}`,
    `Website hint: ${website || '-'}`,
    `Tracker notes: ${notes || '-'}`,
    '',
    'Candidate profile:',
    JSON.stringify(profile, null, 2),
    '',
    'Requirements:',
    '- Subject: concise, role-specific, and non-generic. Do not write "Internship Application - CompanyName". Reference what you are actually connecting on.',
    '- Intro lines: ONE opening sentence. If a genuine specific hook was found (named team, project, technical area), name it plainly. If hookType is general, write a direct honest sentence about why the candidate is reaching out — no simulated specificity.',
    '- Do not force a specific-sounding opener when no genuine hook was found. A plain honest sentence is better than a fabricated or half-formed specific one.',
    '- Body lines: Explain the candidate-company connection in narrative form. Show skills through what was built or studied, never as a list. One line on the fit, one line on what the candidate brings, one line on the ask.',
    '- Keep the draft plain enough that it could have been written directly by the candidate in one sitting. Specific is good; polished admiration is not.',
    '- Do NOT produce a skill list anywhere. If skills appear, they must be embedded in a sentence explaining what was built or studied.',
    '- Underclaim rather than overclaim. Avoid phrases like "exactly the kind of environment I want to grow in", "my work and studies have pushed me toward", "that focus is why I am writing to you specifically", or "your work stands out for".',
    '- Treat the candidate as a junior applicant. Do not oversell ownership, scope, confidence, or certainty of fit.',
    '- Do not compliment the company at length. One concrete fact is enough to justify the email.',
    '- hookType: mission (company mission alignment), technical (specific technical area match), product (specific product or system they build), team (specific named team or researcher), general (fallback only if nothing specific found).',
    '- contactEmail: search aggressively for a real email address. Try in this order: (1) company "contact" or "team" page, (2) academic staff page or research group page, (3) GitHub profile bio of founders or team leads, (4) published papers listing author contact, (5) common patterns like careers@, internships@, info@, hello@ with the company domain. Only leave empty if nothing credible is found after all attempts.',
    '- recommendedAttachments: prefer resume always, transcript when student-proof matters, portfolioLink when the portfolio has directly relevant project work.',
    '- warnings should include cases like "No public internship email found", "Use careers form instead", or "Contact path is indirect — reply rate may be low".'
  ].join('\n');
}

function buildPolishMailPrompt({ company, draft, profile, tonePreset = 'balanced', includePortfolioLink = false }) {
  const toneInstructionMap = {
    balanced: 'Keep the tone plain, modest, and natural. If a sentence sounds like it is trying to impress, simplify it.',
    technical: 'Lean more technical and concrete, but stay plain and modest. Specific engineering detail is better than big framing.',
    concise: 'Make it shorter and sharper. Remove filler and keep only the strongest points.',
    warm: 'Make it warmer and more human while staying professional. Do not add praise-heavy or soft corporate phrases.',
    corporate: 'Make it more formal without sounding generic, HR-like, or over-rehearsed.'
  };
  return [
    'Return JSON matching this schema exactly:',
    '{',
    '  "subject": "string",',
    '  "introLines": ["string"],',
    '  "bodyLines": ["string"],',
    '  "warnings": ["string"]',
    '}',
    '',
    `Target company: ${company || draft?.companyName || '-'}`,
    '',
    'Candidate profile summary:',
    JSON.stringify(pickProfileSummary(profile), null, 2),
    '',
    'Researched draft JSON:',
    JSON.stringify(draft, null, 2),
    '',
    'Rewrite rules:',
    '- Open with one company-specific sentence, but keep it plain and readable. No dramatic framing, no inflated wording, no thesis-statement energy.',
    '- Mention the company area directly. Do not explain back to them why their approach is special, distinctive, or notable.',
    '- The candidate should sound capable, curious, and grounded, not exceptional, destined, or unusually polished.',
    '- The candidate is a junior applicant. Keep the voice modest and realistic, with no self-congratulatory or high-status phrasing.',
    '- Skills must appear through natural context only. Never produce a comma-separated skill list. Prefer one simple concrete sentence over layered abstractions.',
    '- Do not force hidden rhetorical structure. If "why this person / why this company / why now" makes the draft sound AI-written, drop the pattern and write normally.',
    '- Slight underclaiming is good. Use earned claims only and let the company fact carry the specificity.',
    '- The closing should sound like something a real student would send. Short, direct, and not over-crafted.',
    '- Remove filler phrases: "for context", "as well", "I would like to", "I am interested in", "I am reaching out because", "that overlap is why I am writing".',
    '- Avoid praise-heavy lines or meta explanations such as "that is why I am writing to you specifically". One factual reference is enough.',
    '- Avoid these patterns unless the draft absolutely needs them: "exactly the kind of", "I want to grow in", "my work and studies have pushed me toward", "I\'d welcome a short conversation about whether there is a fit", "your work stands out for".',
    '- Avoid these self-positioning patterns too: "what I bring", "I can contribute by", "where I want to contribute now", or anything that makes the candidate sound more senior than an intern applicant.',
    '- Ban these tones unless the draft explicitly needs them: grand, literary, highly polished, consultant-like, or motivational.',
    '- Maximum 4–6 content sentences. The full email including greeting and signature must fit in one screen.',
    '- Mention attached resume and transcript in one brief natural sentence integrated into the body — never as its own paragraph.',
    includePortfolioLink && profile.application?.portfolioUrl
      ? `- If useful, mention the portfolio link ${profile.application.portfolioUrl} plainly as supporting material. Do not turn it into a pitch.`
      : '- Do not mention a portfolio link unless explicitly requested.',
    '- Prefer wording that a skeptical professor, engineer, or recruiter would believe was written directly by the candidate.',
    '- If a sentence sounds like polished application copy, rewrite it as something the candidate would realistically type.',
    '- Do not invent achievements or claims not in the profile or draft.',
    `- ${toneInstructionMap[tonePreset] || toneInstructionMap.balanced}`,
    '- warnings should only contain real risks or caveats that still matter after polishing.'
  ].join('\n');
}

function normalizeAttachmentPlan(value, profile) {
  const plan = value && typeof value === 'object' ? value : {};
  const hasPortfolio = Boolean(normalizeString(profile?.application?.portfolioUrl));
  const resume = plan.resume !== false;
  const transcript = Boolean(plan.transcript);
  const portfolioLink = hasPortfolio && Boolean(plan.portfolioLink);
  const enabled = [
    resume ? 'Resume' : null,
    transcript ? 'Transcript' : null,
    portfolioLink ? 'Portfolio link' : null
  ].filter(Boolean);
  return {
    resume,
    transcript,
    portfolioLink,
    combinationLabel: normalizeString(plan.combinationLabel, enabled.join(' + ') || 'No attachments'),
    rationale: normalizeString(plan.rationale, 'No recommendation reason returned.')
  };
}

function mergeAttachmentPreferences(basePlan, preferences, profile) {
  const merged = {
    ...(basePlan && typeof basePlan === 'object' ? basePlan : {}),
    ...(preferences && typeof preferences === 'object' ? preferences : {})
  };
  return normalizeAttachmentPlan(merged, profile);
}

function buildAgentResearchResult({ researchedDraft, company, website, profile, researchContent, researchPayload }) {
  return {
    researchedDraft,
    recommendedAttachments: normalizeAttachmentPlan(researchedDraft?.recommendedAttachments, profile),
    assets: getApplicationAssets(profile),
    smtpConfigured: Boolean(getSmtpConfig()),
    sources: researchContent.sources,
    profileContext: {
      portfolioUrl: normalizeString(profile.application?.portfolioUrl)
    },
    usage: researchPayload?.usage || null,
    meta: {
      companyName: normalizeString(researchedDraft?.companyName, company),
      companyWebsite: normalizeString(researchedDraft?.companyWebsite, website),
      careersUrl: normalizeString(researchedDraft?.careersUrl),
      contactEmail: normalizeString(researchedDraft?.contactEmail),
      contactReason: normalizeString(researchedDraft?.contactReason),
      confidence: normalizeString(researchedDraft?.confidence, 'low'),
      hookType: normalizeString(researchedDraft?.hookType, 'general'),
      companySignals: normalizeStringList(researchedDraft?.companySignals, []),
      personalAngles: normalizeStringList(researchedDraft?.personalAngles, []),
      warnings: normalizeStringList(researchedDraft?.warnings, [])
    }
  };
}

function finalizeMailSentence(value) {
  let text = normalizeString(value).replace(/\s+/g, ' ').trim();
  if (!text) return '';
  text = text
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .replace(/\.\.+/g, '.')
    .trim();
  if (text && !/[.!?]$/.test(text)) text += '.';
  return text;
}

function normalizeRelevantDetail(value) {
  return normalizeString(value)
    .replace(/\bshowing that\b.*$/i, '')
    .replace(/\bwhich shows that\b.*$/i, '')
    .replace(/^your\s+/i, '')
    .replace(/^public work around\s+/i, 'work on ')
    .replace(/^work around\s+/i, 'work on ')
    .replace(/^research around\s+/i, 'research on ')
    .trim();
}

function sanitizeMailSentence(line) {
  let text = normalizeString(line);
  if (!text) return '';

  const tieMatch = text.match(/^(.*?)(?:\s+stood out|\s+stands out)\s+because it ties\s+(.+)$/i);
  if (tieMatch) {
    return finalizeMailSentence(`${tieMatch[1]} ties ${tieMatch[2]}`);
  }

  const becauseMatch = text.match(/^(.*?)(?:\s+stood out|\s+stands out)\s+because\s+(.+)$/i);
  if (becauseMatch) {
    return finalizeMailSentence(`${becauseMatch[1]} focuses on ${becauseMatch[2]}`);
  }

  const treatingMatch = text.match(/^(.*?)(?:\s+stood out|\s+stands out)\s+for treating\s+(.+)$/i);
  if (treatingMatch) {
    return finalizeMailSentence(`${treatingMatch[1]} works on ${treatingMatch[2]}`);
  }

  const sameDirectionMatch = text.match(/^My work (?:has been|is) moving in (?:that|the same) [^:]+:\s*I approach security by (.+)$/i);
  if (sameDirectionMatch) {
    text = `In my studies and projects, I have been focusing on ${sameDirectionMatch[1]}`;
  }

  const pushedTowardMatch = text.match(/^My work and studies have pushed me toward (.+)$/i);
  if (pushedTowardMatch) {
    text = `I have been focusing more on ${pushedTowardMatch[1]}`;
  }

  const workOnRelevantMatch = text.match(/^That (?:focus makes|makes) .* work on (.+?) especially relevant.*$/i);
  if (workOnRelevantMatch) {
    text = `Your work on ${workOnRelevantMatch[1]} is relevant to me`;
  }

  const particularlyWithMatch = text.match(/^That .* particularly with (.+)$/i);
  if (particularlyWithMatch) {
    const detail = normalizeRelevantDetail(particularlyWithMatch[1]);
    if (detail) text = `Your ${detail} is relevant to me`;
  }

  text = text
    .replace(/\bespecially compelling\b/gi, 'relevant')
    .replace(/\bparticularly compelling\b/gi, 'relevant')
    .replace(/\bvery compelling\b/gi, 'relevant')
    .replace(/\bexactly the kind of environment I want to grow in\b/gi, 'a direction I want to learn more in')
    .replace(/\bwhere I want to contribute now\b/gi, 'that I want to learn more about')
    .replace(/\bthat focus is why I am writing to you specifically\b/gi, 'that is why I am writing')
    .replace(/\bI(?:'|’)d welcome a short conversation about whether there(?:'|’)s a fit(?: for an internship or early-career role)?\b/gi, 'If there is a fit, I would be glad to talk')
    .replace(/\bI(?:'|’)d welcome a short conversation about whether there is a fit(?: for an internship or early-career role)?\b/gi, 'If there is a fit, I would be glad to talk')
    .replace(/\bwhat I bring\b/gi, 'my background')
    .replace(/\bI can contribute by\b/gi, 'I can support this work through')
    .replace(/\b now\b/gi, '')
    .trim();

  return finalizeMailSentence(text);
}

function sanitizeMailLines(lines) {
  return normalizeStringList(lines, [])
    .map((line) => sanitizeMailSentence(line))
    .filter(Boolean);
}

function cleanCompanyFocusPhrase(value, company) {
  const companyName = normalizeString(company);
  const escapedCompany = companyName ? companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
  let text = normalizeString(value);
  if (!text) return '';

  if (escapedCompany) {
    text = text.replace(new RegExp(`^${escapedCompany}(?:['’]s)?\\s+`, 'i'), '');
  }

  text = text
    .replace(/\b(?:stood|stands) out\b.*$/i, '')
    .replace(/\b(?:is|are) especially relevant.*$/i, '')
    .replace(/\bshowing that\b.*$/i, '')
    .replace(/\bwhich shows that\b.*$/i, '')
    .replace(/^your\s+/i, '')
    .replace(/^public work around\s+/i, '')
    .replace(/^public work on\s+/i, '')
    .replace(/^work around\s+/i, '')
    .replace(/^work on\s+/i, '')
    .replace(/^works on\s+/i, '')
    .replace(/^research around\s+/i, '')
    .replace(/^research on\s+/i, '')
    .replace(/\bCyber Security Engineer work for the\b/i, '')
    .replace(/\bEngineer work for the\b/i, '')
    .replace(/\brole for the\b/i, '')
    .replace(/\brole on the\b/i, '')
    .replace(/\bit treats hardware behavior as a security problem, not just a software one\b/i, 'hardware-level security problems')
    .replace(/\bvehicle-level cyber-security requirements directly to regulated compliance under\b/i, 'vehicle-level cyber-security requirements under')
    .replace(/\s+/g, ' ')
    .replace(/^[,;:\-\s]+|[,;:\-\s]+$/g, '')
    .trim();

  return text;
}

function pickCompanyFocusPhrase({ company, researchedDraft }) {
  const candidates = [
    ...normalizeStringList(researchedDraft?.companySignals, []),
    ...normalizeStringList(researchedDraft?.introLines, []),
    normalizeString(researchedDraft?.subject)
  ];

  for (const candidate of candidates) {
    const cleaned = cleanCompanyFocusPhrase(candidate, company);
    if (cleaned && cleaned.length >= 12) return cleaned;
  }
  return 'embedded systems and security';
}

function buildPlainIntroLine({ company, researchedDraft }) {
  const companyName = normalizeString(researchedDraft?.companyName, company || 'the team');
  const focus = pickCompanyFocusPhrase({ company: companyName, researchedDraft });
  return finalizeMailSentence(`I saw that ${companyName} is working on ${focus}`);
}

function buildPlainBackgroundLine(tonePreset = 'balanced') {
  const variants = {
    balanced: 'I am a Computer Engineering student focusing on embedded systems and security, especially firmware and device behavior.',
    technical: 'I am a Computer Engineering student focusing on embedded systems and security, especially firmware behavior, device communication, and telemetry.',
    concise: 'I am a Computer Engineering student focusing on embedded systems, firmware, and security.',
    warm: 'I am a Computer Engineering student focusing on embedded systems and security, especially firmware and device behavior.',
    corporate: 'I am a Computer Engineering student focused on embedded systems and security, especially firmware and device-level behavior.'
  };
  return finalizeMailSentence(variants[tonePreset] || variants.balanced);
}

function buildPlainCloseLine({ recommendedAttachments, tonePreset = 'balanced' }) {
  const attachments = [];
  if (recommendedAttachments?.resume !== false) attachments.push('resume');
  if (recommendedAttachments?.transcript) attachments.push('transcript');

  let attachmentText = 'my resume';
  if (attachments.length === 2) attachmentText = 'my resume and transcript';
  else if (attachments.length === 1 && attachments[0] === 'transcript') attachmentText = 'my transcript';

  const variants = {
    balanced: `I attached ${attachmentText}. If there is an internship fit in your team, I would be happy to talk.`,
    technical: `I attached ${attachmentText}. If there is an internship fit in your team, I would be happy to talk.`,
    concise: `I attached ${attachmentText}. If there is an internship fit, I would be happy to talk.`,
    warm: `I attached ${attachmentText}. If there is an internship fit in your team, I would be happy to talk.`,
    corporate: `I attached ${attachmentText}. If there is an internship fit in your team, I would be happy to discuss it further.`
  };
  return finalizeMailSentence(variants[tonePreset] || variants.balanced);
}

function buildPlainMailLines({ company, researchedDraft, recommendedAttachments, tonePreset = 'balanced' }) {
  return {
    introLines: [buildPlainIntroLine({ company, researchedDraft })],
    bodyLines: [
      buildPlainBackgroundLine(tonePreset),
      buildPlainCloseLine({ recommendedAttachments, tonePreset })
    ].filter(Boolean)
  };
}

function buildAgentFinalDraft({ researchedDraft, polishedDraft, company, website, profile, recommendedAttachments, tonePreset = 'balanced' }) {
  const signatureLines = normalizeStringList(profile.application?.emailSignature, []);
  const plainLines = buildPlainMailLines({
    company,
    researchedDraft,
    recommendedAttachments,
    tonePreset
  });
  const introLines = plainLines.introLines;
  const bodyLines = plainLines.bodyLines;
  const warnings = normalizeStringList(polishedDraft?.warnings, normalizeStringList(researchedDraft?.warnings, []));
  const cc = normalizeString(profile.application?.cc);
  const safety = evaluateSendSafety({
    contactEmail: normalizeString(researchedDraft?.contactEmail),
    confidence: normalizeString(researchedDraft?.confidence, 'low'),
    warnings
  });

  return {
    companyName: normalizeString(researchedDraft?.companyName, company),
    companyWebsite: normalizeString(researchedDraft?.companyWebsite, website),
    careersUrl: normalizeString(researchedDraft?.careersUrl),
    contactEmail: normalizeString(researchedDraft?.contactEmail),
    contactReason: normalizeString(researchedDraft?.contactReason),
    confidence: normalizeString(researchedDraft?.confidence, 'low'),
    subject: normalizeString(polishedDraft?.subject, normalizeString(researchedDraft?.subject, `Internship Application - ${company}`)),
    introLines,
    bodyLines,
    signatureLines,
    body: buildDraftBody({ introLines, bodyLines, signatureLines }),
    hookType: normalizeString(researchedDraft?.hookType, 'general'),
    companySignals: normalizeStringList(researchedDraft?.companySignals, []),
    personalAngles: normalizeStringList(researchedDraft?.personalAngles, []),
    warnings,
    recommendedAttachments,
    safety,
    tonePreset,
    cc
  };
}

async function runApplicationAgentResearch({ apiKey, company, location, notes, website }) {
  const profile = await readProfile();
  const researchPayload = await callOpenAIResponses({
    apiKey,
    model: OPENAI_RESEARCH_MODEL,
    instructions: APPLICATION_AGENT_SYSTEM_PROMPT,
    input: buildApplicationAgentPrompt({
      company,
      location,
      notes,
      website,
      profile: pickProfileSummary(profile)
    }),
    maxOutputTokens: 1500,
    tools: [{ type: 'web_search_preview' }],
    textFormat: { type: 'json_object' },
    reasoningEffort: 'minimal'
  });
  const researchContent = collectOpenAIContent(researchPayload);
  const researchedDraft = parseAgentResearchText(researchPayload.output_text || researchContent.rawText);
  return buildAgentResearchResult({ researchedDraft, company, website, profile, researchContent, researchPayload });
}

async function runApplicationAgentPolish({ apiKey, company, draftInput, tonePreset = 'balanced', includePortfolioLink = false }) {
  const profile = await readProfile();
  const polishPayload = await callOpenAIResponses({
    apiKey,
    model: OPENAI_POLISH_MODEL,
    instructions: POLISH_MAIL_SYSTEM_PROMPT,
    input: buildPolishMailPrompt({
      company,
      draft: draftInput,
      profile,
      tonePreset,
      includePortfolioLink
    }),
    maxOutputTokens: 900,
    textFormat: { type: 'json_object' },
    reasoningEffort: 'low'
  });
  const polishedDraft = parseAgentJson(polishPayload.output_text || collectOpenAIContent(polishPayload).rawText);
  return {
    polishedDraft,
    signatureLines: normalizeStringList(profile.application?.emailSignature, []),
    usage: polishPayload?.usage || null,
    profile
  };
}

function evaluateSendSafety({ contactEmail, confidence, warnings }) {
  const normalizedWarnings = normalizeStringList(warnings, []);
  const normalizedConfidence = normalizeString(confidence, 'low').toLowerCase();
  const reasons = [];

  if (!normalizeString(contactEmail)) {
    reasons.push('No recipient email was found.');
  }
  if (normalizedConfidence === 'low') {
    reasons.push('Contact confidence is low.');
  }
  normalizedWarnings.forEach((warning) => {
    const lowered = warning.toLowerCase();
    if (lowered.includes('no public') || lowered.includes('use careers form') || lowered.includes('uncertain') || lowered.includes('not verified')) {
      reasons.push(warning);
    }
  });

  const uniqueReasons = Array.from(new Set(reasons));
  return {
    allowDirectSend: uniqueReasons.length === 0,
    level: uniqueReasons.length === 0 ? 'safe' : 'draft_only',
    reasons: uniqueReasons
  };
}

function parseAgentJson(rawText) {
  const trimmed = String(rawText || '').trim();
  const jsonStart = trimmed.indexOf('{');
  const jsonEnd = trimmed.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    throw new Error('Agent response did not include valid JSON.');
  }
  return JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1));
}

function parseAgentResearchText(rawText) {
  const text = String(rawText || '').replace(/\r/g, '').trim();
  if (!text) {
    throw new Error('Agent research response was empty.');
  }

  const singleFields = {
    COMPANY_NAME: 'companyName',
    COMPANY_WEBSITE: 'companyWebsite',
    CAREERS_URL: 'careersUrl',
    CONTACT_EMAIL: 'contactEmail',
    CONTACT_REASON: 'contactReason',
    CONFIDENCE: 'confidence',
    SUBJECT: 'subject',
    HOOK_TYPE: 'hookType',
    COMBINATION_LABEL: 'combinationLabel',
    RATIONALE: 'rationale'
  };
  const listFields = {
    INTRO_LINES: 'introLines',
    BODY_LINES: 'bodyLines',
    COMPANY_SIGNALS: 'companySignals',
    PERSONAL_ANGLES: 'personalAngles',
    WARNINGS: 'warnings'
  };

  const result = {
    companyName: '',
    companyWebsite: '',
    careersUrl: '',
    contactEmail: '',
    contactReason: '',
    confidence: 'low',
    subject: '',
    hookType: 'general',
    introLines: [],
    bodyLines: [],
    companySignals: [],
    personalAngles: [],
    warnings: [],
    recommendedAttachments: {
      resume: true,
      transcript: false,
      portfolioLink: false,
      combinationLabel: '',
      rationale: ''
    }
  };

  let currentSection = '';
  let inAttachmentSection = false;

  text.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const headerMatch = trimmed.match(/^([A-Z_]+):\s*(.*)$/);
    if (headerMatch) {
      const [, header, value] = headerMatch;
      inAttachmentSection = header === 'RECOMMENDED_ATTACHMENTS';
      currentSection = header;
      if (singleFields[header]) {
        result[singleFields[header]] = value.trim();
      } else if (listFields[header]) {
        result[listFields[header]] = [];
      }
      return;
    }

    if (inAttachmentSection) {
      const attachmentMatch = trimmed.match(/^[-*]\s*(resume|transcript|portfolioLink)\s*:\s*(true|false)\s*$/i);
      if (attachmentMatch) {
        const key = attachmentMatch[1];
        result.recommendedAttachments[key] = attachmentMatch[2].toLowerCase() === 'true';
      }
      return;
    }

    if (listFields[currentSection] && /^[-*]\s+/.test(trimmed)) {
      result[listFields[currentSection]].push(trimmed.replace(/^[-*]\s+/, '').trim());
    }
  });

  result.recommendedAttachments.combinationLabel = result.combinationLabel;
  result.recommendedAttachments.rationale = result.rationale;
  delete result.combinationLabel;
  delete result.rationale;

  return result;
}

// Purpose: map varied spreadsheet headers (export format + Turkish aliases) to canonical row shape
function normalizeImportRow(raw) {
  const pick = (...keys) => {
    for (const key of keys) {
      if (key in raw && raw[key] !== undefined && raw[key] !== null && String(raw[key]).trim() !== '') {
        return raw[key];
      }
    }
    return '';
  };
  const idRaw = pick('Id', 'ID', 'id');
  const idNum = idRaw === '' ? 0 : Number(idRaw);
  return {
    Id: Number.isFinite(idNum) ? idNum : 0,
    Company: String(pick('Company', 'company', 'Şirket', 'Sirket')).trim(),
    Status: String(pick('Status', 'status', 'Durum') || 'Researching').trim(),
    Notes: String(pick('Notes', 'notes', 'Açıklama', 'Aciklama')).trim(),
    Website: String(pick('Website', 'website', 'URL', 'url')).trim(),
    Tag: String(pick('Tag', 'tag', 'Şehir', 'Sehir', 'Location')).trim(),
    'Fit Score': pick('Fit Score', 'FitScore', 'fit_score'),
    'Applied At': String(pick('Applied At', 'AppliedAt', 'applied_at')).trim(),
    'Follow-up At': String(pick('Follow-up At', 'Followup At', 'FollowupAt', 'followup_at')).trim(),
    'Reply Received At': String(pick('Reply Received At', 'ReplyReceivedAt')).trim(),
    'Reply Outcome': String(pick('Reply Outcome', 'ReplyOutcome')).trim(),
    Priority: String(pick('Priority', 'priority') || 'Medium').trim() || 'Medium',
    'Focus Tags': String(pick('Focus Tags', 'FocusTags')).trim(),
    'Created At': String(pick('Created At', 'CreatedAt')).trim(),
    'Updated At': String(pick('Updated At', 'UpdatedAt')).trim()
  };
}

// Purpose: upsert rows from sheet_to_json; optional replace wipes table first (dangerous; UI confirms)
function importInternshipRows(rawRows, options = {}) {
  const replace = Boolean(options.replace);
  const rows = rawRows.map(normalizeImportRow).filter((r) => r.Company);
  if (!rows.length) {
    return { rowCount: 0, message: 'No rows with a company name found.' };
  }

  const upsert = db.transaction((items) => {
    items.forEach((item) => {
      const id = Number(item.Id || 0);
      const company = String(item.Company || '').trim();
      if (!company) return;
      const status = String(item.Status || 'Researching').trim();
      const notes = String(item.Notes || '').trim();
      const website = String(item.Website || '').trim();
      const tag = String(item.Tag || '').trim();
      const appliedAt = String(item['Applied At'] || '').trim();
      const followupAt = String(item['Follow-up At'] || '').trim();
      const replyReceivedAt = String(item['Reply Received At'] || '').trim();
      const replyOutcome = String(item['Reply Outcome'] || '').trim();
      const priority = String(item.Priority || 'Medium').trim() || 'Medium';
      const focusTags = String(item['Focus Tags'] || '').trim();
      const fitScore =
        Number(item['Fit Score'] || 0) ||
        computeFitScore({
          company,
          status,
          notes,
          website,
          tag
        });
      const createdAt = String(item['Created At'] || '').trim() || new Date().toISOString();
      const updatedAt = String(item['Updated At'] || '').trim() || new Date().toISOString();

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
            replyReceivedAt || null,
            replyOutcome || '',
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
            replyReceivedAt || null,
            replyOutcome || '',
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
          replyReceivedAt || null,
          replyOutcome || '',
          priority || 'Medium',
          focusTags || ''
        );
      }
    });
  });

  if (replace) {
    db.exec('DELETE FROM internships');
  }
  upsert(rows);
  return { rowCount: rows.length, message: replace ? 'Replaced dataset.' : 'Merged into tracker.' };
}

function syncFromExcel() {
  if (!fs.existsSync(excelPath)) return;
  const workbook = xlsx.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return;
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });
  if (!rows.length) return;
  importInternshipRows(rows, { replace: false });
}

function excelIsNewer() {
  if (!fs.existsSync(excelPath)) return false;
  if (!fs.existsSync(dbPath)) return true;
  const excelStat = fs.statSync(excelPath);
  const dbStat = fs.statSync(dbPath);
  return excelStat.mtimeMs > dbStat.mtimeMs;
}

app.get('/api/profile', async (req, res) => {
  res.json(await readProfile());
});

app.put('/api/profile', async (req, res) => {
  let resolveOp, rejectOp;
  const opPromise = new Promise((res, rej) => {
    resolveOp = res;
    rejectOp = rej;
  });

  profileWriteLock = profileWriteLock.then(async () => {
    try {
      const existing = profileCache || await readProfile();
      const merged = {
        ...existing,
        ...(req.body && typeof req.body === 'object' ? req.body : {}),
        sources: Array.isArray(req.body?.sources) ? req.body.sources : existing.sources
      };

      const normalized = normalizeProfileInput(merged, existing);
      normalized.updatedAt = nowIso();
      await fs.promises.writeFile(profilePath, JSON.stringify(normalized, null, 2));
      profileCache = normalized;
      resolveOp(normalized);
    } catch (e) {
      rejectOp(e);
    }
  }).catch(() => {});

  try {
    res.json(await opPromise);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/internships', (req, res) => {
  res.json(selectAll.all());
});

app.get('/api/internships/:id/activity', (req, res) => {
  const { id } = req.params;
  res.json(selectActivity.all(Number(id)));
});

app.get('/api/internships/:id/mail-drafts', (req, res) => {
  const { id } = req.params;
  res.json(selectMailDraftsByInternship.all(Number(id)).map(formatMailDraftRow));
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
  const { company, status, notes, website, tag, applied_at, followup_at, reply_received_at, reply_outcome, priority, focus_tags, fit_score } = req.body || {};
  if (!company || typeof company !== 'string') {
    return res.status(400).json({ error: 'Company is required.' });
  }
  const finalStatus = status && typeof status === 'string' ? status : 'Researching';
  const fitScore = normalizeFitScoreInput(fit_score, computeFitScore({
    company,
    status: finalStatus,
    notes,
    website,
    tag
  }));
  const info = insertOne.run(
    company.trim(),
    finalStatus.trim(),
    notes ? String(notes) : '',
    website ? String(website) : '',
    tag ? String(tag) : '',
    fitScore,
    applied_at ? String(applied_at) : null,
    followup_at ? String(followup_at) : null,
    reply_received_at ? String(reply_received_at) : null,
    reply_outcome ? String(reply_outcome) : '',
    priority ? String(priority) : 'Medium',
    focus_tags ? String(focus_tags) : ''
  );
  addActivity(info.lastInsertRowid, 'created', null, getBaseChangePayload({
    company: company.trim(),
    status: finalStatus.trim(),
    notes: notes ? String(notes) : '',
    website: website ? String(website) : '',
    tag: tag ? String(tag) : '',
    fit_score: fitScore,
    priority: priority ? String(priority) : 'Medium',
    applied_at: applied_at ? String(applied_at) : '',
    followup_at: followup_at ? String(followup_at) : '',
    reply_received_at: reply_received_at ? String(reply_received_at) : '',
    reply_outcome: reply_outcome ? String(reply_outcome) : '',
    focus_tags: focus_tags ? String(focus_tags) : ''
  }));
  syncExcel();
  res.status(201).json({ id: info.lastInsertRowid });
});

app.put('/api/internships/:id', (req, res) => {
  const { id } = req.params;
  const { company, status, notes, website, tag, applied_at, followup_at, reply_received_at, reply_outcome, priority, focus_tags, fit_score } = req.body || {};
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
    fit_score: normalizeFitScoreInput(fit_score, existing.fit_score ?? computeFitScore(existing)),
    priority: priority ? String(priority) : 'Medium',
    applied_at: applied_at ? String(applied_at) : '',
    followup_at: followup_at ? String(followup_at) : '',
    reply_received_at: reply_received_at ? String(reply_received_at) : '',
    reply_outcome: reply_outcome ? String(reply_outcome) : '',
    focus_tags: focus_tags ? String(focus_tags) : ''
  };
  const previousPayload = getBaseChangePayload(existing);
  const info = updateOne.run(
    nextPayload.company,
    nextPayload.status,
    nextPayload.notes,
    nextPayload.website,
    nextPayload.tag,
    nextPayload.fit_score,
    nextPayload.applied_at || null,
    nextPayload.followup_at || null,
    nextPayload.reply_received_at || null,
    nextPayload.reply_outcome || '',
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
    if (changes.reply_received_at || changes.reply_outcome) {
      addActivity(Number(id), 'reply updated', {
        reply_received_at: previousPayload.reply_received_at,
        reply_outcome: previousPayload.reply_outcome
      }, {
        reply_received_at: nextPayload.reply_received_at,
        reply_outcome: nextPayload.reply_outcome
      });
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
      updateOne.run(
        next.company,
        next.status,
        next.notes,
        next.website,
        next.tag,
        next.fit_score ?? row.fit_score ?? computeFitScore(row),
        next.applied_at || null,
        next.followup_at || null,
        next.reply_received_at || null,
        next.reply_outcome || '',
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

app.patch('/api/internships/:id/fit-score', (req, res) => {
  const { id } = req.params;
  const existing = getInternship(Number(id));
  if (!existing) {
    return res.status(404).json({ error: 'Not found.' });
  }

  const fitScore = normalizeFitScoreInput(req.body?.fit_score, null);
  if (fitScore == null) {
    return res.status(400).json({ error: 'A fit_score between 1 and 5 is required.' });
  }

  const info = db.prepare(`
    UPDATE internships
    SET fit_score = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(fitScore, Number(id));

  if (info.changes === 0) {
    return res.status(404).json({ error: 'Not found.' });
  }

  if (Number(existing.fit_score ?? 0) !== fitScore) {
    addActivity(Number(id), 'edited', getBaseChangePayload(existing), {
      ...getBaseChangePayload(existing),
      fit_score: fitScore
    });
  }

  syncExcel();
  res.json({ ok: true, fit_score: fitScore });
});

app.post('/api/analyze', async (req, res) => {
  const apiKey = normalizeString(req.body?.apiKey);
  const company = normalizeString(req.body?.company);
  const location = normalizeString(req.body?.location, '-');
  const notes = typeof req.body?.notes === 'string' ? req.body.notes.trim() : '-';
  const cvText = typeof req.body?.cvText === 'string' ? req.body.cvText.trim() : '';

  if (!apiKey) {
    return res.status(400).json({ error: 'OpenAI API key is required.' });
  }
  if (!company) {
    return res.status(400).json({ error: 'Company is required.' });
  }
  if (!cvText) {
    return res.status(400).json({ error: 'CV text is required.' });
  }

  try {
    const payload = await callOpenAIResponses({
      apiKey,
      model: OPENAI_RESEARCH_MODEL,
      instructions: ANALYZE_SYSTEM_PROMPT,
      input: buildAnalyzeUserPrompt({ company, location, notes, cvText }),
      maxOutputTokens: 1200,
      tools: [{ type: 'web_search_preview' }],
      reasoningEffort: 'minimal'
    });
    const content = collectOpenAIContent(payload);

    const sections = parseAnalysisSections(content.rawText);
    const verdictScore = extractVerdictScore(sections.verdict, content.rawText);

    return res.json({
      rawText: content.rawText,
      sections,
      verdictScore,
      sources: content.sources,
      usage: payload?.usage || null
    });
  } catch (error) {
    return res.status(502).json({
      error: error instanceof Error ? error.message : 'Analysis request failed.'
    });
  }
});

app.post('/api/application-agent/prepare', async (req, res) => {
  const apiKey = normalizeString(req.body?.apiKey);
  const company = normalizeString(req.body?.company);
  const location = normalizeString(req.body?.location, '-');
  const notes = typeof req.body?.notes === 'string' ? req.body.notes.trim() : '-';
  const website = normalizeString(req.body?.website, '-');

  if (!apiKey) {
    return res.status(400).json({ error: 'OpenAI API key is required.' });
  }
  if (!company) {
    return res.status(400).json({ error: 'Company is required.' });
  }

  try {
    const researchResult = await runApplicationAgentResearch({ apiKey, company, location, notes, website });
    const polishResult = await runApplicationAgentPolish({
      apiKey,
      company,
      draftInput: researchResult.researchedDraft,
      includePortfolioLink: researchResult.recommendedAttachments.portfolioLink
    });
    const draft = buildAgentFinalDraft({
      researchedDraft: researchResult.researchedDraft,
      polishedDraft: polishResult.polishedDraft,
      company,
      website,
      profile: polishResult.profile,
      recommendedAttachments: researchResult.recommendedAttachments
    });
    const draftId = createMailDraftRecord({
      internshipId: Number(req.body?.internshipId || 0) || 0,
      company: draft.companyName || company,
      draft
    });
    const savedDraft = formatMailDraftRow(selectMailDraftById.get(draftId))?.draft || draft;

    return res.json({
      draftId,
      draft: savedDraft,
      assets: researchResult.assets,
      smtpConfigured: researchResult.smtpConfigured,
      sources: researchResult.sources,
      profileContext: researchResult.profileContext,
      defaults: {
        tonePreset: 'balanced'
      },
      usage: {
        research: researchResult.usage,
        polish: polishResult.usage
      }
    });
  } catch (error) {
    return res.status(502).json({
      error: error instanceof Error ? error.message : 'Application agent failed.'
    });
  }
});

app.post('/api/application-agent/research', async (req, res) => {
  const apiKey = normalizeString(req.body?.apiKey);
  const company = normalizeString(req.body?.company);
  const location = normalizeString(req.body?.location, '-');
  const notes = typeof req.body?.notes === 'string' ? req.body.notes.trim() : '-';
  const website = normalizeString(req.body?.website, '-');

  if (!apiKey) {
    return res.status(400).json({ error: 'OpenAI API key is required.' });
  }
  if (!company) {
    return res.status(400).json({ error: 'Company is required.' });
  }

  try {
    const researchResult = await runApplicationAgentResearch({ apiKey, company, location, notes, website });
    return res.json({
      ...researchResult.meta,
      draft: researchResult.researchedDraft,
      recommendedAttachments: researchResult.recommendedAttachments,
      assets: researchResult.assets,
      smtpConfigured: researchResult.smtpConfigured,
      sources: researchResult.sources,
      profileContext: researchResult.profileContext,
      usage: researchResult.usage
    });
  } catch (error) {
    return res.status(502).json({
      error: error instanceof Error ? error.message : 'Application agent research failed.'
    });
  }
});

app.post('/api/application-agent/polish', async (req, res) => {
  const apiKey = normalizeString(req.body?.apiKey);
  const company = normalizeString(req.body?.company);
  const tonePreset = normalizeString(req.body?.tonePreset, 'balanced').toLowerCase();
  const includePortfolioLink = Boolean(req.body?.includePortfolioLink);
  const draftInput = req.body?.draft;

  if (!apiKey) {
    return res.status(400).json({ error: 'OpenAI API key is required.' });
  }
  if (!draftInput || typeof draftInput !== 'object') {
    return res.status(400).json({ error: 'Draft payload is required.' });
  }

  try {
    const polishResult = await runApplicationAgentPolish({
      apiKey,
      company,
      draftInput,
      tonePreset,
      includePortfolioLink
    });
    const plainLines = buildPlainMailLines({
      company: company || draftInput?.companyName || '',
      researchedDraft: draftInput,
      recommendedAttachments: draftInput?.recommendedAttachments || {
        resume: true,
        transcript: false,
        portfolioLink: false
      },
      tonePreset
    });
    const introLines = plainLines.introLines;
    const bodyLines = plainLines.bodyLines;
    return res.json({
      subject: normalizeString(polishResult.polishedDraft?.subject, normalizeString(draftInput?.subject, company ? `Internship Application - ${company}` : 'Internship Application')),
      introLines,
      bodyLines,
      signatureLines: polishResult.signatureLines,
      body: buildDraftBody({ introLines, bodyLines, signatureLines: polishResult.signatureLines }),
      warnings: normalizeStringList(polishResult.polishedDraft?.warnings, normalizeStringList(draftInput?.warnings, [])),
      tonePreset,
      usage: polishResult.usage
    });
  } catch (error) {
    return res.status(502).json({
      error: error instanceof Error ? error.message : 'Polish request failed.'
    });
  }
});

app.post('/api/application-agent/stream-research', async (req, res) => {
  const apiKey = normalizeString(req.body?.apiKey);
  const company = normalizeString(req.body?.company);
  const location = normalizeString(req.body?.location, '-');
  const notes = typeof req.body?.notes === 'string' ? req.body.notes.trim() : '-';
  const website = normalizeString(req.body?.website, '-');
  const tonePreset = normalizeString(req.body?.tonePreset, 'balanced').toLowerCase();
  const attachmentPreferences = req.body?.attachmentPreferences && typeof req.body?.attachmentPreferences === 'object'
    ? req.body.attachmentPreferences
    : {};

  if (!apiKey) {
    return res.status(400).json({ error: 'OpenAI API key is required.' });
  }
  if (!company) {
    return res.status(400).json({ error: 'Company is required.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let aborted = false;
  // For SSE we must track the response lifecycle, not the request body lifecycle.
  // `req.close` can fire as soon as the POST body is fully received, which would
  // incorrectly cancel the OpenAI stream before any research events arrive.
  res.on('close', () => { aborted = true; });

  function send(eventType, data) {
    if (aborted) return;
    res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  let currentStage = {
    step: 'research',
    status: 'running',
    summary: `Researching ${company} across public web sources.`
  };
  const heartbeatTimer = setInterval(() => {
    send('heartbeat', {
      type: 'heartbeat',
      ...currentStage,
      at: new Date().toISOString()
    });
  }, 8000);

  try {
    send('stage', currentStage);

    const profile = await readProfile();
    const streamParams = {
      apiKey,
      model: OPENAI_RESEARCH_MODEL,
      instructions: APPLICATION_AGENT_SYSTEM_PROMPT,
      input: buildApplicationAgentPrompt({
        company,
        location,
        notes,
        website,
        profile: pickProfileSummary(profile)
      }),
      maxOutputTokens: 1500,
      tools: [{ type: 'web_search_preview' }],
      textFormat: { type: 'json_object' },
      reasoningEffort: 'minimal'
    };

    let accumulatedText = '';
    let completedResponse = null;

    for await (const event of streamOpenAIResponses(streamParams)) {
      if (aborted) break;
      const { type, data } = event;

      if (type === 'response.web_search_call.in_progress') {
        send('search', { type: 'search', status: 'in_progress' });
      } else if (type === 'response.web_search_call.completed') {
        send('search', { type: 'search', status: 'completed' });
      } else if (type === 'response.output_item.added') {
        const item = data?.item || data?.output_item;
        if (item?.type === 'web_search_call' || item?.action?.type === 'web_search') {
          const query = item?.action?.query || item?.query || '';
          send('search', { type: 'search', status: 'in_progress', query });
        }
      } else if (type === 'response.output_text.delta') {
        const delta = data?.delta || '';
        accumulatedText += delta;
        send('text_delta', { type: 'text_delta', delta });
      } else if (type === 'response.completed') {
        completedResponse = data?.response || data;
      }
    }

    if (aborted) {
      res.end();
      return;
    }

    // Extract final text from completed response if available
    let finalText = accumulatedText;
    if (completedResponse) {
      const completedContent = collectOpenAIContent(completedResponse);
      if (completedContent.rawText) {
        finalText = completedContent.rawText;
      }
      // Also try output_text property
      if (completedResponse.output_text) {
        finalText = completedResponse.output_text;
      }
    }

    currentStage = {
      step: 'shape',
      status: 'running',
      summary: 'Structuring the raw research into a usable first-pass draft.'
    };
    send('stage', currentStage);

    const researchedDraft = parseAgentResearchText(finalText || accumulatedText);

    // Build research result sources from completed response or fallback
    let researchSources = [];
    if (completedResponse) {
      researchSources = collectOpenAIContent(completedResponse).sources;
    }
    const researchResult = buildAgentResearchResult({
      researchedDraft,
      company,
      website,
      profile,
      researchContent: { sources: researchSources },
      researchPayload: completedResponse || {}
    });
    const selectedAttachments = mergeAttachmentPreferences(
      researchResult.recommendedAttachments,
      attachmentPreferences,
      profile
    );

    currentStage = {
      step: 'polish',
      status: 'running',
      summary: 'Polishing the message into a cleaner final outreach email.'
    };
    send('stage', currentStage);

    const polishResult = await runApplicationAgentPolish({
      apiKey,
      company: researchedDraft?.companyName || company,
      draftInput: researchedDraft,
      tonePreset,
      includePortfolioLink: Boolean(selectedAttachments?.portfolioLink)
    });

    const draft = buildAgentFinalDraft({
      researchedDraft,
      polishedDraft: polishResult.polishedDraft,
      company,
      website,
      profile,
      recommendedAttachments: selectedAttachments,
      tonePreset
    });
    const draftId = createMailDraftRecord({
      internshipId: Number(req.body?.internshipId || 0) || 0,
      company: draft.companyName || company,
      draft
    });
    const savedDraft = formatMailDraftRow(selectMailDraftById.get(draftId))?.draft || draft;

    currentStage = {
      step: 'ready',
      status: 'ready',
      summary: `Draft ready for ${draft.companyName || company}.`
    };
    send('stage', currentStage);
    send('draft', {
      type: 'draft',
      draftId,
      draft: savedDraft,
      sources: researchResult.sources,
      assets: researchResult.assets,
      smtpConfigured: researchResult.smtpConfigured,
      profileContext: researchResult.profileContext
    });

    res.end();
  } catch (err) {
    send('error', { type: 'error', message: err instanceof Error ? err.message : 'Streaming preparation failed.' });
    res.end();
  } finally {
    clearInterval(heartbeatTimer);
  }
});

app.post('/api/application-agent/log-action', async (req, res) => {
  const internshipId = Number(req.body?.internshipId || 0) || null;
  const action = normalizeString(req.body?.action);
  const meta = req.body?.meta && typeof req.body?.meta === 'object' ? req.body.meta : {};

  if (!internshipId) {
    return res.status(400).json({ error: 'internshipId is required.' });
  }
  if (!action) {
    return res.status(400).json({ error: 'action is required.' });
  }

  if (action === 'gmail-sent-confirmed') {
    addActivity(internshipId, 'email sent', null, {
      ...meta,
      source: 'gmail_manual_confirmation'
    });
    return res.json({ ok: true });
  }

  addActivity(internshipId, `agent ${action}`, null, meta);
  return res.json({ ok: true });
});

app.post('/api/application-agent/drafts', async (req, res) => {
  const internshipId = Number(req.body?.internshipId || 0) || null;
  const company = normalizeString(req.body?.company);
  const draft = req.body?.draft && typeof req.body?.draft === 'object' ? req.body.draft : null;
  const status = normalizeString(req.body?.status, 'draft');

  if (!internshipId) {
    return res.status(400).json({ error: 'internshipId is required.' });
  }
  if (!draft) {
    return res.status(400).json({ error: 'draft payload is required.' });
  }

  const draftId = createMailDraftRecord({
    internshipId,
    company: company || normalizeString(draft.companyName),
    draft,
    status
  });
  const row = selectMailDraftById.get(draftId);
  return res.json({
    ok: true,
    draftId,
    draft: formatMailDraftRow(row)?.draft || draft
  });
});

app.put('/api/application-agent/drafts/:id', async (req, res) => {
  const draftId = Number(req.params.id || 0) || null;
  const draft = req.body?.draft && typeof req.body?.draft === 'object' ? req.body.draft : null;
  const status = normalizeString(req.body?.status);

  if (!draftId) {
    return res.status(400).json({ error: 'draft id is required.' });
  }
  if (!draft) {
    return res.status(400).json({ error: 'draft payload is required.' });
  }

  const ok = updateMailDraftRecord({ draftId, draft, status });
  if (!ok) {
    return res.status(404).json({ error: 'Draft not found.' });
  }

  return res.json({ ok: true, draftId });
});

app.delete('/api/application-agent/drafts/:id', async (req, res) => {
  const draftId = Number(req.params.id || 0) || null;
  if (!draftId) {
    return res.status(400).json({ error: 'draft id is required.' });
  }
  const info = deleteMailDraft.run(draftId);
  if (!info.changes) {
    return res.status(404).json({ error: 'Draft not found.' });
  }
  return res.json({ ok: true, draftId });
});

app.post('/api/application-agent/send', async (req, res) => {
  const profile = await readProfile();
  const smtpConfig = getSmtpConfig();
  if (!smtpConfig) {
    return res.status(400).json({
      error: 'SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS to enable direct sending.'
    });
  }

  const to = normalizeString(req.body?.to);
  const subject = normalizeString(req.body?.subject);
  const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';
  const internshipId = Number(req.body?.internshipId || 0) || null;
  const includeResume = req.body?.includeResume !== false;
  const includeTranscript = Boolean(req.body?.includeTranscript);
  const includePortfolioLink = Boolean(req.body?.includePortfolioLink);
  const cc = normalizeString(req.body?.cc || profile.application?.cc);
  const from = normalizeString(profile.application?.senderEmail || smtpConfig.auth.user || process.env.SMTP_FROM);
  const senderName = normalizeString(profile.application?.senderName);
  const confidence = normalizeString(req.body?.confidence, 'low');
  const warnings = normalizeStringList(req.body?.warnings, []);
  const tonePreset = normalizeString(req.body?.tonePreset, 'balanced');
  const hookType = normalizeString(req.body?.hookType, 'general');

  if (!to) {
    return res.status(400).json({ error: 'Recipient email is required.' });
  }
  if (!subject) {
    return res.status(400).json({ error: 'Subject is required.' });
  }
  if (!body) {
    return res.status(400).json({ error: 'Body is required.' });
  }

  const safety = evaluateSendSafety({ contactEmail: to, confidence, warnings });
  if (!safety.allowDirectSend) {
    return res.status(400).json({
      error: `Direct send is locked: ${safety.reasons.join(' | ') || 'Review required.'}`
    });
  }

  const assets = getApplicationAssets(profile);
  const attachments = [];
  if (includeResume) {
    if (!assets.resume.exists) {
      return res.status(400).json({ error: 'Resume file is missing. Update the profile before sending.' });
    }
    attachments.push({ filename: assets.resume.name, path: assets.resume.path });
  }
  if (includeTranscript) {
    if (!assets.transcript.exists) {
      return res.status(400).json({ error: 'Transcript file is missing. Update the profile before sending.' });
    }
    attachments.push({ filename: assets.transcript.name, path: assets.transcript.path });
  }

  try {
    const transporter = nodemailer.createTransport(smtpConfig);
    const info = await transporter.sendMail({
      from: senderName ? `"${senderName}" <${from}>` : from,
      to,
      cc: cc || undefined,
      subject,
      text: body,
      attachments
    });

    if (internshipId) {
      const existing = getInternship(internshipId);
      if (existing) {
        addActivity(internshipId, 'email sent', null, {
          to,
          cc,
          subject,
          attachments: attachments.map((item) => item.filename),
          attachmentCombo: [
            includeResume ? 'Resume' : null,
            includeTranscript ? 'Transcript' : null,
            includePortfolioLink ? 'Portfolio link' : null
          ].filter(Boolean).join(' + ') || 'None',
          tonePreset,
          hookType,
          confidence,
          safetyLevel: safety.level
        });
      }
    }

    return res.json({
      ok: true,
      messageId: info.messageId || '',
      accepted: info.accepted || [],
      rejected: info.rejected || []
    });
  } catch (error) {
    return res.status(502).json({
      error: error instanceof Error ? error.message : 'Send failed.'
    });
  }
});

app.get('/api/dashboard/outcomes', (req, res) => {
  const internships = selectAll.all();
  const activities = selectAllActivity.all();
  const internshipMap = new Map(internships.map((item) => [Number(item.id), item]));

  const sentEvents = activities
    .filter((item) => item.event_type === 'email sent')
    .map((item) => {
      const payload = safeJsonParse(item.new_value, {});
      return {
        internshipId: Number(item.internship_id),
        createdAt: item.created_at,
        payload: payload && typeof payload === 'object' ? payload : {},
        entry: internshipMap.get(Number(item.internship_id)) || null
      };
    });

  const summarizeBy = (getter) => {
    const map = new Map();
    sentEvents.forEach((event) => {
      const keys = getter(event).filter(Boolean);
      const replyOutcome = normalizeString(event.entry?.reply_outcome);
      const replyReceived = Boolean(normalizeString(event.entry?.reply_received_at));
      const positive = replyOutcome === 'positive';
      keys.forEach((key) => {
        if (!map.has(key)) {
          map.set(key, { label: key, sent: 0, positive: 0, negative: 0, neutral: 0, pending: 0 });
        }
        const bucket = map.get(key);
        bucket.sent += 1;
        if (positive) bucket.positive += 1;
        else if (replyOutcome === 'negative') bucket.negative += 1;
        else if (replyOutcome === 'neutral') bucket.neutral += 1;
        else if (!replyReceived) bucket.pending += 1;
        else bucket.pending += 1;
      });
    });
    return Array.from(map.values())
      .map((item) => ({
        ...item,
        successRate: item.sent ? Math.round((item.positive / item.sent) * 100) : 0
      }))
      .sort((a, b) => {
        if (b.successRate !== a.successRate) return b.successRate - a.successRate;
        return b.sent - a.sent;
      })
      .slice(0, 6);
  };

  const companyTypes = summarizeBy((event) => normalizeString(event.entry?.focus_tags)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean));
  const hookTypes = summarizeBy((event) => [normalizeString(event.payload?.hookType, 'general')]);
  const attachmentMixes = summarizeBy((event) => [normalizeString(event.payload?.attachmentCombo, 'None')]);
  const tonePresets = summarizeBy((event) => [normalizeString(event.payload?.tonePreset, 'balanced')]);

  const blocked = activities.filter((item) => item.event_type === 'agent send-blocked').length;
  const drafts = activities.filter((item) => item.event_type === 'agent draft-opened').length;
  const cancelled = activities.filter((item) => item.event_type === 'agent cancelled').length;

  return res.json({
    totals: {
      sent: sentEvents.length,
      replied: sentEvents.filter((event) => Boolean(normalizeString(event.entry?.reply_received_at))).length,
      positive: sentEvents.filter((event) => normalizeString(event.entry?.reply_outcome) === 'positive').length,
      blocked,
      drafts,
      cancelled
    },
    companyTypes,
    hookTypes,
    attachmentMixes,
    tonePresets
  });
});

app.get('/api/export', (req, res) => {
  if (!fs.existsSync(excelPath)) {
    syncExcel();
  }
  res.download(excelPath, 'internships.xlsx');
});

app.post('/api/import', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 15 MB).' : err.message || 'Upload failed.';
      return res.status(400).json({ error: msg });
    }
    next();
  });
}, (req, res) => {
  try {
    const replace =
      req.query.replace === '1' ||
      req.query.replace === 'true' ||
      req.body?.replace === 'true' ||
      req.body?.replace === true;
    if (!req.file?.buffer?.length) {
      return res.status(400).json({ error: 'No file uploaded. Use form field name \"file\" (.xlsx).' });
    }
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).json({ error: 'Workbook has no sheets.' });
    }
    const sheet = workbook.Sheets[sheetName];
    const rawRows = xlsx.utils.sheet_to_json(sheet, { defval: '' });
    if (!rawRows.length) {
      return res.status(400).json({ error: 'Sheet is empty.' });
    }
    const result = importInternshipRows(rawRows, { replace });
    syncExcel();
    res.json({ ok: true, ...result });
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Import failed.' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  await ensureProfileFile();
  if (excelIsNewer()) {
    syncFromExcel();
  }
  backfillFitScores();
  backfillPriority();
  syncExcel();
  console.log(`Server running on http://localhost:${port}`);
});
