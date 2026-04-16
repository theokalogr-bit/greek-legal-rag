"""
Tool: ingest_pdf
Extracts text from a PDF, chunks it, and stores in a local JSON index.
Zero ML dependencies — pure Python + pdfplumber only.

Inputs:
    pdf_path (str): Absolute path to the PDF file
    filename (str): Original filename — used as the document identifier

Outputs:
    int: Number of chunks created

Raises:
    ValueError: If no text can be extracted or no chunks created
"""

import re
import json
import pdfplumber
from pathlib import Path

INDEX_PATH = Path(__file__).parent.parent / "index.json"
CHUNK_SIZE = 600
CHUNK_OVERLAP = 100


def _load_index() -> list[dict]:
    if INDEX_PATH.exists():
        return json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    return []


def _save_index(chunks: list[dict]):
    INDEX_PATH.write_text(json.dumps(chunks, ensure_ascii=False, indent=2), encoding="utf-8")


def _extract_text(pdf_path: str) -> list[dict]:
    pages = []
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text and text.strip():
                pages.append({"page": i + 1, "text": text.strip()})
    return pages


def _chunk_text(text: str) -> list[str]:
    text = re.sub(r'\s+', ' ', text).strip()
    if len(text) <= CHUNK_SIZE:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        end = start + CHUNK_SIZE
        if end >= len(text):
            chunks.append(text[start:])
            break
        bp = text.rfind('. ', start, end)
        if bp == -1 or bp <= start:
            bp = text.rfind(' ', start, end)
        if bp == -1 or bp <= start:
            bp = end
        chunks.append(text[start:bp + 1].strip())
        next_start = bp + 1 - CHUNK_OVERLAP
        start = max(start + 50, next_start)  # always advance by at least 50 chars
    return [c for c in chunks if c.strip()]


def ingest_pdf(pdf_path: str, filename: str) -> int:
    pages = _extract_text(pdf_path)
    if not pages:
        raise ValueError("No text could be extracted from this PDF.")

    # Load existing index, remove old chunks for this file
    index = [c for c in _load_index() if c["document_name"] != filename]

    new_chunks = []
    chunk_index = 0
    for page_data in pages:
        for chunk in _chunk_text(page_data["text"]):
            new_chunks.append({
                "id": f"{filename}__p{page_data['page']}__c{chunk_index}",
                "document_name": filename,
                "page": page_data["page"],
                "chunk_index": chunk_index,
                "text": chunk
            })
            chunk_index += 1

    if not new_chunks:
        raise ValueError("No text chunks could be created.")

    _save_index(index + new_chunks)
    return len(new_chunks)


def get_document_list() -> dict:
    index = _load_index()
    documents = sorted({c["document_name"] for c in index})
    return {"documents": documents, "total_chunks": len(index)}


def delete_document(filename: str) -> int:
    index = _load_index()
    remaining = [c for c in index if c["document_name"] != filename]
    deleted = len(index) - len(remaining)
    if deleted:
        _save_index(remaining)
    return deleted
