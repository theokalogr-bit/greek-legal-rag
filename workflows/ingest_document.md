# Workflow: Ingest a PDF Document

## Objective
Take an uploaded PDF file, extract its text, chunk it, embed it, and store it in ChromaDB so it can be queried.

## Required Inputs
- `pdf_path` — path to the temporary file on disk
- `filename` — original filename (used as the document identifier)

## Tool to Use
`tools/ingest_pdf.py` → `ingest_pdf(pdf_path, filename)`

## Steps
1. Validate the file is a PDF and under 10MB (handled in main.py before this workflow runs)
2. Call `ingest_pdf(pdf_path, filename)`
   - Extracts text page by page using pdfplumber
   - Chunks text at ~600 characters with 100-character overlap, breaking at sentence boundaries
   - Embeds chunks with `paraphrase-multilingual-MiniLM-L12-v2` (handles Greek)
   - Stores in ChromaDB with metadata: document_name, page, chunk_index
   - If the document already exists, old chunks are deleted before re-ingesting
3. Return the number of chunks created

## Expected Output
```json
{ "filename": "law_4635.pdf", "chunks_created": 142, "status": "success" }
```

## Edge Cases
- **No extractable text** — pdfplumber returns nothing (scanned image PDFs). Raises `ValueError`. Tell the user to use a text-based PDF.
- **Re-ingesting** — same filename uploaded again. Old chunks are deleted automatically before re-ingesting.
- **Very short documents** — may produce only 1–2 chunks. That's fine.

## Notes
- ChromaDB is persisted to `chroma_db/` at the project root (gitignored)
- The embedding model is loaded once per process (singleton) — first request is slower
