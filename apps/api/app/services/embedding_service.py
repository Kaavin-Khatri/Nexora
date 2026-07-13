"""384-dim embeddings via fastembed (ONNX) — local-first, no PyTorch.

Model BAAI/bge-small-en-v1.5 (384-dim) chosen over sentence-transformers to keep
the free-tier (512MB) container small. Lazy singleton, warmed at API startup.
"""

import re

from app.core.config import settings
from app.schemas.resume_parsed import ParsedResume

MODEL_NAME = "BAAI/bge-small-en-v1.5"
DIM = 384

_model = None


def warmup():
    """Load the model once. Called at FastAPI startup (lifespan) and lazily by
    embed_text as a safety net."""
    global _model
    if _model is None:
        from fastembed import TextEmbedding

        _model = TextEmbedding(model_name=MODEL_NAME, cache_dir=settings.FASTEMBED_CACHE or None)
    return _model


def model_loaded() -> bool:
    return _model is not None


def embed_text(text: str) -> list[float]:
    model = warmup()
    return [float(x) for x in next(iter(model.embed([text])))]


def _top_bullets(parsed: ParsedResume, n: int) -> list[str]:
    bullets = [b.strip() for exp in parsed.experience for b in exp.bullets if b.strip()]
    # strongest first: quantified bullets (contain a number) before the rest,
    # original order preserved within each group. Deterministic.
    order = sorted(range(len(bullets)), key=lambda i: (0 if re.search(r"\d", bullets[i]) else 1, i))
    return [bullets[i] for i in order[:n]]


def build_resume_embed_text(parsed: ParsedResume, skills: list[str]) -> str:
    """Deterministic embed text. TEMPLATE (VERBATIM — jobs mirror this in 7.3 so
    both vectors share one semantic space):

        {summary or name}. {years} years experience. Skills: {skills csv}. {up to 5 strongest bullets}
    """
    lead = parsed.summary or parsed.contact.name or "Candidate"
    years = parsed.total_years_estimate or 0
    bullets = _top_bullets(parsed, 5)
    return (
        f"{lead}. {years} years experience. Skills: {', '.join(skills)}. {' '.join(bullets)}"
    ).strip()
