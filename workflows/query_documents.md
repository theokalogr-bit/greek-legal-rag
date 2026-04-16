# Workflow: Query Documents

## Objective
Take a natural language question (Greek or English), find the most relevant chunks across all ingested documents, and generate a cited answer using Claude.

## Required Inputs
- `question` (str) — the user's question
- `top_k` (int, optional) — number of source chunks to retrieve (default: 5)

## Tools to Use
1. `tools/semantic_search.py` → `semantic_search(question, top_k)`
2. `tools/generate_answer.py` → `generate_answer(question, sources)`

## Steps
1. Check that at least one document is ingested (via `get_document_list()` in ingest_pdf.py). If empty, return early with a clear message.
2. Call `semantic_search(question, top_k)` — embeds the question and retrieves the top_k most relevant chunks by cosine similarity
3. Call `generate_answer(question, sources)` — builds a context string from the chunks and asks Claude to answer with citations
4. Return the answer, sources, and document count

## Expected Output
```json
{
  "answer": "Σύμφωνα με το άρθρο 5 του Ν.4635/2019 (law_4635.pdf, σελ. 12)...",
  "sources": [
    { "document_name": "law_4635.pdf", "page": 12, "chunk_text": "...", "relevance_score": 0.87 }
  ],
  "documents_searched": 3
}
```

## Edge Cases
- **No documents ingested** — return a clear message before running search
- **Low relevance scores** — still return results; let Claude say "not found in documents" if context is insufficient
- **Mixed language** — Claude responds in the same language as the question (Greek → Greek, English → English)
- **Cross-document queries** — semantic search queries all documents simultaneously; no need to specify which document

## Notes
- Prompt caching is enabled on Claude's system prompt — repeated queries cost less after the first
- Relevance score is cosine similarity (0–1, higher = more relevant). Scores below 0.4 are usually weak matches.
