import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import nodemailer from 'nodemailer';
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

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
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
    fit_score: row.fit_score ?? 0,
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

function ensureProfileFile() {
  if (fs.existsSync(profilePath)) {
    return;
  }
  fs.writeFileSync(profilePath, JSON.stringify(cloneProfileSeed(), null, 2));
}

function readProfile() {
  ensureProfileFile();
  const raw = fs.readFileSync(profilePath, 'utf8');
  const parsed = safeJsonParse(raw, null);
  if (!parsed) {
    const fallback = normalizeProfileInput(cloneProfileSeed(), PROFILE_SEED);
    fs.writeFileSync(profilePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
  return normalizeProfileInput(parsed, PROFILE_SEED);
}

function writeProfile(profile) {
  const normalized = normalizeProfileInput(profile, readProfile());
  normalized.updatedAt = nowIso();
  fs.writeFileSync(profilePath, JSON.stringify(normalized, null, 2));
  return normalized;
}

function pickProfileSummary(profile) {
  return {
    name: profile.identity?.name || '',
    headline: profile.identity?.headline || '',
    currentFocus: profile.identity?.currentFocus || '',
    targetRoles: profile.identity?.targetRoles || [],
    executiveSummary: profile.summary?.executive || '',
    positioning: profile.summary?.positioning || '',
    technicalSkills: profile.skills?.technical || [],
    domainSkills: profile.skills?.domains || [],
    focusAreas: profile.skills?.focusAreas || [],
    languages: profile.languages || [],
    identityStatement: profile.strategy?.identityStatement || '',
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

function collectAnthropicContent(response) {
  const blocks = Array.isArray(response?.content) ? response.content : [];
  const textParts = [];
  const citations = [];
  const searchResults = [];
  const toolErrors = [];

  blocks.forEach((block) => {
    if (block?.type === 'text' && typeof block.text === 'string' && block.text.trim()) {
      textParts.push(block.text.trim());
      if (Array.isArray(block.citations)) {
        block.citations.forEach((citation) => {
          if (citation?.url) citations.push(citation);
        });
      }
      return;
    }

    if (block?.type !== 'web_search_tool_result') return;
    const items = Array.isArray(block.content) ? block.content : [block.content].filter(Boolean);
    items.forEach((item) => {
      if (item?.type === 'web_search_result' && item.url) {
        searchResults.push(item);
      }
      if (item?.type === 'web_search_tool_result_error') {
        toolErrors.push(item.error_code || 'unknown_error');
      }
    });
  });

  const uniqueSources = Array.from(new Map(
    [...citations, ...searchResults]
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
    sources: uniqueSources,
    toolErrors
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
  'You are an outreach agent for internship applications.',
  'Use web search to find the most relevant company website, careers page, and if available a public contact email for student or internship outreach.',
  'Return strict JSON only. No markdown. No prose before or after the JSON.',
  'If a fact is uncertain, mark it in confidence or notes instead of inventing certainty.'
].join(' ');

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
    "4. MAIL HOOK: Write 2-3 sentences I can use as the opening of my initiative application email — specific to this company's research/work, not generic",
    '5. VERDICT: Rate fit 1-5 and explain in one sentence',
    '',
    'My CV:',
    cvText || '-',
    '',
    'Be concise. Use bullet points. No fluff.',
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
    'Return JSON matching this schema exactly:',
    '{',
    '  "companyName": "string",',
    '  "companyWebsite": "string",',
    '  "careersUrl": "string",',
    '  "contactEmail": "string",',
    '  "contactReason": "string",',
    '  "confidence": "high|medium|low",',
    '  "subject": "string",',
    '  "introLines": ["string"],',
    '  "bodyLines": ["string"],',
    '  "companySignals": ["string"],',
    '  "personalAngles": ["string"],',
    '  "warnings": ["string"]',
    '}',
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
    '- Subject should sound like a concise internship outreach mail.',
    '- Intro lines should be the opening paragraph, specific to the company and their work.',
    '- Body lines should mention fit, relevant background, and that resume plus transcript are attached.',
    '- contactEmail should be empty if you cannot find a credible public address.',
    '- warnings should include cases like "No public internship email found" or "Use careers form instead".'
  ].join('\n');
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

app.get('/api/profile', (req, res) => {
  res.json(readProfile());
});

app.put('/api/profile', (req, res) => {
  const existing = readProfile();
  const merged = {
    ...existing,
    ...(req.body && typeof req.body === 'object' ? req.body : {}),
    sources: Array.isArray(req.body?.sources) ? req.body.sources : existing.sources
  };
  res.json(writeProfile(merged));
});

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
  const { company, status, notes, website, tag, applied_at, followup_at, priority, focus_tags, fit_score } = req.body || {};
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
    focus_tags: focus_tags ? String(focus_tags) : ''
  }));
  syncExcel();
  res.status(201).json({ id: info.lastInsertRowid });
});

app.put('/api/internships/:id', (req, res) => {
  const { id } = req.params;
  const { company, status, notes, website, tag, applied_at, followup_at, priority, focus_tags, fit_score } = req.body || {};
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
      updateOne.run(
        next.company,
        next.status,
        next.notes,
        next.website,
        next.tag,
        next.fit_score ?? row.fit_score ?? computeFitScore(row),
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
    return res.status(400).json({ error: 'Anthropic API key is required.' });
  }
  if (!company) {
    return res.status(400).json({ error: 'Company is required.' });
  }
  if (!cvText) {
    return res.status(400).json({ error: 'CV text is required.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        system: ANALYZE_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: buildAnalyzeUserPrompt({ company, location, notes, cvText })
          }
        ],
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 5
          }
        ]
      })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json({
        error: payload?.error?.message || payload?.error || 'Anthropic request failed.'
      });
    }

    const content = collectAnthropicContent(payload);
    if (content.toolErrors.length) {
      return res.status(502).json({
        error: `Web search failed: ${content.toolErrors.join(', ')}`
      });
    }

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
    return res.status(400).json({ error: 'Anthropic API key is required.' });
  }
  if (!company) {
    return res.status(400).json({ error: 'Company is required.' });
  }

  const profile = readProfile();
  const assets = getApplicationAssets(profile);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: APPLICATION_AGENT_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: buildApplicationAgentPrompt({
              company,
              location,
              notes,
              website,
              profile: pickProfileSummary(profile)
            })
          }
        ],
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 6
          }
        ]
      })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json({
        error: payload?.error?.message || payload?.error || 'Anthropic request failed.'
      });
    }

    const content = collectAnthropicContent(payload);
    if (content.toolErrors.length) {
      return res.status(502).json({
        error: `Web search failed: ${content.toolErrors.join(', ')}`
      });
    }

    const draft = parseAgentJson(content.rawText);
    const signatureLines = normalizeStringList(profile.application?.emailSignature, []);
    const introLines = normalizeStringList(draft?.introLines, []);
    const bodyLines = normalizeStringList(draft?.bodyLines, []);
    const cc = normalizeString(profile.application?.cc);

    return res.json({
      draft: {
        companyName: normalizeString(draft?.companyName, company),
        companyWebsite: normalizeString(draft?.companyWebsite, website),
        careersUrl: normalizeString(draft?.careersUrl),
        contactEmail: normalizeString(draft?.contactEmail),
        contactReason: normalizeString(draft?.contactReason),
        confidence: normalizeString(draft?.confidence, 'low'),
        subject: normalizeString(draft?.subject, `Internship Application - ${company}`),
        introLines,
        bodyLines,
        signatureLines,
        body: buildDraftBody({ introLines, bodyLines, signatureLines }),
        companySignals: normalizeStringList(draft?.companySignals, []),
        personalAngles: normalizeStringList(draft?.personalAngles, []),
        warnings: normalizeStringList(draft?.warnings, []),
        cc
      },
      assets,
      smtpConfigured: Boolean(getSmtpConfig()),
      sources: content.sources
    });
  } catch (error) {
    return res.status(502).json({
      error: error instanceof Error ? error.message : 'Application agent failed.'
    });
  }
});

app.post('/api/application-agent/send', async (req, res) => {
  const profile = readProfile();
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
  const cc = normalizeString(req.body?.cc || profile.application?.cc);
  const from = normalizeString(profile.application?.senderEmail || smtpConfig.auth.user || process.env.SMTP_FROM);
  const senderName = normalizeString(profile.application?.senderName);

  if (!to) {
    return res.status(400).json({ error: 'Recipient email is required.' });
  }
  if (!subject) {
    return res.status(400).json({ error: 'Subject is required.' });
  }
  if (!body) {
    return res.status(400).json({ error: 'Body is required.' });
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
          attachments: attachments.map((item) => item.filename)
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
  ensureProfileFile();
  if (excelIsNewer()) {
    syncFromExcel();
  }
  backfillFitScores();
  backfillPriority();
  syncExcel();
  console.log(`Server running on http://localhost:${port}`);
});
