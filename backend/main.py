"""
Agent layer — FastAPI orchestrator.
Reads workflows/ for each operation, then delegates to tools/ for execution.

Workflows:
  - workflows/ingest_document.md  → tools/ingest_pdf.py
  - workflows/query_documents.md  → tools/semantic_search.py + tools/generate_answer.py
"""

import sys
import tempfile
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Add project root to path so tools/ is importable
sys.path.insert(0, str(Path(__file__).parent.parent))

from tools.ingest_pdf import ingest_pdf, get_document_list, delete_document
from tools.semantic_search import semantic_search
from tools.generate_answer import generate_answer
from backend.models import QueryRequest, QueryResponse, IngestResponse, DocumentListResponse, Source

load_dotenv()

app = FastAPI(
    title="Greek Legal RAG API",
    description="Upload Greek legal PDFs and query them with AI-powered semantic search",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/documents", response_model=DocumentListResponse)
def list_documents():
    """List all ingested documents."""
    result = get_document_list()
    return DocumentListResponse(**result)


@app.post("/ingest", response_model=IngestResponse)
async def ingest_document(file: UploadFile = File(...)):
    """
    Upload and ingest a PDF.
    Workflow: workflows/ingest_document.md
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    if file.size and file.size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be under 10MB.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        chunks = ingest_pdf(tmp_path, file.filename)
        return IngestResponse(filename=file.filename, chunks_created=chunks, status="success")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")
    finally:
        Path(tmp_path).unlink(missing_ok=True)


@app.post("/query", response_model=QueryResponse)
def query_documents(request: QueryRequest):
    """
    Query all ingested documents with a natural language question.
    Workflow: workflows/query_documents.md
    """
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    doc_info = get_document_list()
    if doc_info["total_chunks"] == 0:
        raise HTTPException(status_code=400, detail="No documents ingested yet. Upload a PDF first.")

    raw_sources = semantic_search(request.question, top_k=request.top_k or 5)
    answer = generate_answer(request.question, raw_sources)
    sources = [Source(**s) for s in raw_sources]

    return QueryResponse(
        answer=answer,
        sources=sources,
        documents_searched=len(doc_info["documents"])
    )


@app.delete("/documents/{filename}")
def remove_document(filename: str):
    """Delete a document from the index."""
    deleted = delete_document(filename)
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {"deleted_chunks": deleted, "filename": filename}
