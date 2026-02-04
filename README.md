# Internship Tracker (Local)

Minimal local tracker backed by SQLite with automatic Excel export.

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Import from Excel

Default import path:
`~/Downloads/ortakVeritabaniGelismisAmaIncelenecek (3).xlsx`

```bash
npm run import
```

To replace existing rows:

```bash
npm run import -- --replace
```

To import a different file:

```bash
npm run import -- /path/to/file.xlsx
```

## Data Files

- SQLite database: `data/internships.db`
- Excel export: `data/internships.xlsx`

Excel is refreshed on every create, update, and delete.
