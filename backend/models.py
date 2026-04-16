from pydantic import BaseModel
from typing import List, Optional


class Source(BaseModel):
    document_name: str
    page: int
    chunk_text: str
    relevance_score: float


class QueryRequest(BaseModel):
    question: str
    top_k: Optional[int] = 5


class QueryResponse(BaseModel):
    answer: str
    sources: List[Source]
    documents_searched: int


class IngestResponse(BaseModel):
    filename: str
    chunks_created: int
    status: str


class DocumentListResponse(BaseModel):
    documents: List[str]
    total_chunks: int
