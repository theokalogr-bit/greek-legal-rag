# Νομικός Βοηθός — Greek Legal AI Assistant

A citizen-facing AI tool that answers questions about Greek law in plain Greek. Powered by Claude claude-sonnet-4-6 + BM25 search over pre-loaded official legislation.

**Ask:** *"Μπορεί ο εργοδότης να με απολύσει χωρίς αποζημίωση;"* — get a cited answer in seconds.

![UI](https://i.imgur.com/placeholder.png)

---

## What It Does

- Answers legal questions in Greek or English
- Searches across multiple laws simultaneously using BM25 ranking
- Returns cited answers with exact document + page number
- Pre-loaded with official Greek legislation — no uploads required
- Category chips: Εργασία · Φόροι · Ενοίκια · Εταιρείες · Καταναλωτής

## Pre-loaded Laws

| Law | Topic | Source |
|-----|-------|--------|
| Ν.4808/2021 | Labor Law (εργατικό) | Ministry of Labor |
| Ν.2251/1994 | Consumer Protection | Ministry of Development |
| Ν.5019/2023 | Consumer Rights Update | Official Gazette |
| AADE Regulations | Tax Authority circulars | AADE |

## Example

**Question:** Τι δικαιώματα έχω αν αγόρασα ελαττωματικό προϊόν;

**Answer:**
> Σύμφωνα με τον Ν.2251/1994 (σελ. 3), ο καταναλωτής δικαιούται αντικατάσταση του προϊόντος, επισκευή, μείωση τιμής ή υπαναχώρηση από τη σύμβαση εντός 2 ετών από την παράδοση.

*Source: N2251_1994_Consumer_Protection.pdf, page 3 — 94% relevance*

## Architecture (WAT Framework)

```
tools/
  ingest_pdf.py       ← PDF extraction + JSON index
  semantic_search.py  ← BM25 ranking (pure Python, zero ML deps)
  generate_answer.py  ← Claude claude-sonnet-4-6 with prompt caching
workflows/
  ingest_document.md  ← SOP: how to add new laws
  query_documents.md  ← SOP: query pipeline
backend/
  main.py             ← FastAPI orchestrator
  models.py           ← Pydantic models
frontend/
  src/                ← React + Tailwind citizen UI
scripts/
  preload_laws.py     ← Auto-download + index laws from et.gr
```

**Zero ML dependencies.** BM25 in pure Python. No torch, no ONNX, no model downloads.

## Setup

```bash
# 1. Clone and install
git clone https://github.com/theokalogr-bit/greek-legal-rag
cd greek-legal-rag
pip install -r requirements.txt

# 2. Set API key
cp .env.example .env
# Add your ANTHROPIC_API_KEY

# 3. Load laws (downloads from official sources)
python3 scripts/preload_laws.py
# Or drop PDFs into pdfs/ and re-run the script

# 4. Start backend
python3 -m uvicorn backend.main:app --port 8000

# 5. Start frontend
cd frontend && npm install && npm run dev
# Open http://localhost:5173
```

## Adding More Laws

Drop any Greek law PDF into `pdfs/` and run:
```bash
python3 scripts/preload_laws.py
```

Official sources: [et.gr](https://search.et.gr/en/) · [e-nomothesia.gr](https://www.e-nomothesia.gr) · Ministry websites

## Stack

| Layer | Tech |
|-------|------|
| Backend | Python · FastAPI · pdfplumber |
| Search | BM25 (pure Python) |
| AI | Claude claude-sonnet-4-6 · Prompt caching |
| Frontend | React · Vite · Tailwind CSS |
| Fonts | Fraunces · DM Sans |
| Storage | JSON flat file — no database needed |
