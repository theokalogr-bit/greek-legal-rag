"""
Tool: semantic_search
BM25 keyword search over the JSON index. Pure Python — zero dependencies.
BM25 is actually ideal for legal text (exact legal term matching).

Inputs:
    question (str): Natural language question
    top_k (int): Number of results to return (default: 5)

Outputs:
    list[dict]: Each dict has keys — document_name, page, chunk_text, relevance_score
"""

import math
import re
from collections import Counter
from tools.ingest_pdf import _load_index


def _tokenize(text: str) -> list[str]:
    return re.findall(r'\w+', text.lower())


def bm25_search(query: str, chunks: list[dict], top_k: int = 5) -> list[dict]:
    """BM25 ranking — works great for legal documents with precise terminology."""
    k1, b = 1.5, 0.75

    tokenized_corpus = [_tokenize(c["text"]) for c in chunks]
    query_tokens = _tokenize(query)

    N = len(tokenized_corpus)
    avg_dl = sum(len(d) for d in tokenized_corpus) / N if N else 1

    # Document frequency for each term
    df = Counter()
    for doc_tokens in tokenized_corpus:
        for term in set(doc_tokens):
            df[term] += 1

    scores = []
    for i, doc_tokens in enumerate(tokenized_corpus):
        dl = len(doc_tokens)
        tf = Counter(doc_tokens)
        score = 0.0
        for term in query_tokens:
            if term not in df:
                continue
            idf = math.log((N - df[term] + 0.5) / (df[term] + 0.5) + 1)
            freq = tf[term]
            tf_score = (freq * (k1 + 1)) / (freq + k1 * (1 - b + b * dl / avg_dl))
            score += idf * tf_score
        scores.append((i, score))

    scores.sort(key=lambda x: x[1], reverse=True)
    top = scores[:top_k]

    max_score = top[0][1] if top and top[0][1] > 0 else 1.0

    results = []
    for idx, score in top:
        if score == 0:
            break
        chunk = chunks[idx]
        results.append({
            "document_name": chunk["document_name"],
            "page": chunk["page"],
            "chunk_text": chunk["text"],
            "relevance_score": round(min(score / max_score, 1.0), 3)
        })

    return results


def semantic_search(question: str, top_k: int = 5) -> list[dict]:
    index = _load_index()
    if not index:
        return []
    return bm25_search(question, index, top_k)
