"""
Tool: generate_answer
Generates a cited answer from Claude using retrieved source chunks as context.
Uses prompt caching on the system prompt to reduce cost on repeated queries.

Inputs:
    question (str): The user's question
    sources (list[dict]): Output from semantic_search — each dict has document_name, page, chunk_text

Outputs:
    str: Claude's answer, grounded in the provided sources

Raises:
    ValueError: If ANTHROPIC_API_KEY is not set
"""

import os
import anthropic

SYSTEM_PROMPT = """You are a legal document assistant specializing in Greek and European legal documents.

Your job is to answer questions based strictly on the provided document excerpts.

Rules:
- Answer only from the provided context. Do not use outside knowledge.
- If the answer is not in the context, say clearly: "This information is not found in the uploaded documents."
- Cite which document and page your answer comes from.
- Be precise and use exact terms from the documents when relevant.
- If the question is in Greek, answer in Greek. If in English, answer in English.
- Keep answers concise but complete."""


def generate_answer(question: str, sources: list[dict]) -> str:
    if not sources:
        return "No documents have been uploaded yet. Please upload a PDF document first."

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY is not set in .env")

    client = anthropic.Anthropic(api_key=api_key)

    context_parts = []
    for i, source in enumerate(sources, 1):
        context_parts.append(
            f"[Source {i} — {source['document_name']}, Page {source['page']}]\n{source['chunk_text']}"
        )
    context = "\n\n---\n\n".join(context_parts)

    user_message = f"""Document excerpts:

{context}

---

Question: {question}

Answer based only on the document excerpts above. Cite the source (document name and page) for your answer."""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"}
            }
        ],
        messages=[{"role": "user", "content": user_message}]
    )

    return response.content[0].text
