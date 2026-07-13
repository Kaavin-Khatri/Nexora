import io
import re

import pdfplumber
from docx import Document

from app.schemas.resume_parsed import ParsedResume
from app.services.llm_client import chat_json


class ParseError(Exception):
    """Human-readable, safe to show the candidate."""


# Verbatim blank-first policy — same convention as the Siko resume parser.
BLANK_FIRST = (
    "If a field is not explicitly present in the resume, return null. "
    "Never infer or fabricate values."
)

SYSTEM_PROMPT = f"""You are a precise resume parser. Read the resume text and return a single JSON \
object matching this exact schema:

{{
  "contact": {{"name": str|null, "email": str|null, "phone": str|null, "location": str|null}},
  "summary": str|null,
  "skills": [str],
  "experience": [{{"title": str|null, "company": str|null, "start": str|null, "end": str|null, \
"current": bool|null, "bullets": [str]}}],
  "education": [{{"degree": str|null, "institution": str|null, "year": str|null}}],
  "certifications": [str],
  "total_years_estimate": number|null
}}

{BLANK_FIRST}
Lists with no items must be []. `total_years_estimate` is a rough number of years of professional \
experience inferred from the dates; use null if there are no dated roles.
Output ONLY the JSON object, no prose."""


def extract_text(data: bytes, ext: str) -> str:
    if ext == ".pdf":
        text = _extract_pdf(data)
    elif ext == ".docx":
        text = _extract_docx(data)
    else:
        raise ParseError(f"Unsupported file type: {ext}")

    text = _normalize(text)
    if len(text) < 200:
        raise ParseError("Could not read text — is this a scanned/image PDF?")
    return text


def _extract_pdf(data: bytes) -> str:
    pages = []
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        for page in pdf.pages:
            pages.append(page.extract_text() or "")
    return "\n".join(pages)


def _extract_docx(data: bytes) -> str:
    doc = Document(io.BytesIO(data))
    return "\n".join(p.text for p in doc.paragraphs)


def _normalize(text: str) -> str:
    text = text.replace("\x00", "")
    lines = [re.sub(r"[ \t]+", " ", ln).strip() for ln in text.splitlines()]
    return "\n".join(ln for ln in lines if ln).strip()


def structure_resume(raw_text: str) -> ParsedResume:
    return chat_json(SYSTEM_PROMPT, f"Resume text:\n{raw_text}", ParsedResume)
