"""Deterministic, explainable ATS scorer. Rules, not vibes.

Pure function of (parsed resume, raw text) → the SAME input always produces the
SAME score, and every point traces to a named check. NO LLM is used here on
purpose — reproducible + explainable beats clever for a number the candidate trusts.

Weights (sum = 100):
  contact completeness      15
  core sections present     20
  quantified-bullet ratio   20
  skills vs role norm band  15
  length band (300-900 wds) 10
  extraction/formatting     10
  action-verb bullet starts 10
"""

import re

from pydantic import BaseModel

from app.schemas.resume_parsed import ParsedResume

# First word of a strong resume bullet. Fixed list → deterministic.
ACTION_VERBS = frozenset(
    """
    accelerated achieved analyzed architected automated built championed
    coordinated created cut delivered designed developed directed drove
    engineered established executed expanded generated grew implemented improved
    increased initiated integrated launched led maintained managed migrated
    mentored modernized negotiated operated optimized orchestrated overhauled
    owned pioneered planned produced reduced refactored resolved scaled shipped
    spearheaded streamlined supported transformed
    """.split()
)

SKILL_BAND = (8, 20)  # ideal number of skills
LENGTH_BAND = (300, 900)  # ideal word count


class Check(BaseModel):
    name: str
    score: float
    max: float
    detail: str


class AtsResult(BaseModel):
    total: float
    checks: list[Check]


def _r(x: float) -> float:
    return round(x, 2)


def _contact(p: ParsedResume) -> Check:
    fields = {
        "name": p.contact.name,
        "email": p.contact.email,
        "phone": p.contact.phone,
        "location": p.contact.location,
    }
    present = [k for k, v in fields.items() if v]
    score = _r(len(present) / 4 * 15)
    return Check(
        name="Contact completeness",
        score=score,
        max=15,
        detail=f"{len(present)} of 4 contact fields present"
        + (f" ({', '.join(present)})" if present else ""),
    )


def _sections(p: ParsedResume) -> Check:
    have = {
        "summary": bool(p.summary),
        "skills": bool(p.skills),
        "experience": bool(p.experience),
        "education": bool(p.education),
    }
    present = [k for k, v in have.items() if v]
    missing = [k for k, v in have.items() if not v]
    score = _r(len(present) * 5)
    detail = f"{len(present)} of 4 core sections present"
    if missing:
        detail += f"; missing: {', '.join(missing)}"
    return Check(name="Core sections present", score=score, max=20, detail=detail)


def _bullets(p: ParsedResume) -> list[str]:
    return [b.strip() for exp in p.experience for b in exp.bullets if b.strip()]


def _quantified(p: ParsedResume) -> Check:
    bullets = _bullets(p)
    if not bullets:
        return Check(
            name="Quantified bullets", score=0, max=20, detail="No experience bullets to assess"
        )
    quantified = sum(1 for b in bullets if re.search(r"\d", b))
    ratio = quantified / len(bullets)
    return Check(
        name="Quantified bullets",
        score=_r(ratio * 20),
        max=20,
        detail=f"{quantified} of {len(bullets)} bullets include a number ({round(ratio * 100)}%)",
    )


def _skills(p: ParsedResume) -> Check:
    n = len(p.skills)
    lo, hi = SKILL_BAND
    if lo <= n <= hi:
        score = 15.0
    elif n < lo:
        score = _r(n / lo * 15)
    else:  # skill-stuffing: mild penalty, floored
        score = _r(max(11, 15 - (n - hi) * 0.4))
    return Check(
        name="Skills count",
        score=score,
        max=15,
        detail=f"{n} skills listed (ideal {lo}–{hi})",
    )


def _length(raw_text: str) -> Check:
    wc = len(raw_text.split())
    lo, hi = LENGTH_BAND
    if lo <= wc <= hi:
        score = 10.0
    elif wc < lo:
        score = _r(wc / lo * 10)
    else:
        score = _r(max(5, 10 - (wc - hi) / 300))
    return Check(
        name="Length",
        score=score,
        max=10,
        detail=f"{wc} words (ideal {lo}–{hi})",
    )


def _formatting(raw_text: str) -> Check:
    # Multi-column / table extraction leaves artifacts: many fragmented short
    # lines and surviving table pipes. ponytail: heuristic with a known ceiling —
    # upgrade to layout-aware extraction (pdfplumber .extract_words xy) if it matters.
    lines = [ln.strip() for ln in raw_text.splitlines() if ln.strip()]
    if not lines:
        return Check(name="Extraction formatting", score=0, max=10, detail="No text to assess")
    short_ratio = sum(1 for ln in lines if len(ln) < 15) / len(lines)
    has_pipes = "|" in raw_text
    penalty = min(6, short_ratio * 12) + (4 if has_pipes else 0)
    score = _r(max(0, 10 - penalty))
    if penalty == 0:
        detail = "Clean extraction, no column/table artifacts"
    else:
        detail = f"Possible multi-column/table artifacts ({round(short_ratio * 100)}% short lines"
        detail += ", table pipes present)" if has_pipes else ")"
    return Check(name="Extraction formatting", score=score, max=10, detail=detail)


def _action_verbs(p: ParsedResume) -> Check:
    bullets = _bullets(p)
    if not bullets:
        return Check(name="Action verbs", score=0, max=10, detail="No experience bullets to assess")
    strong = 0
    for b in bullets:
        first = re.sub(r"^[^a-zA-Z]+", "", b).split(" ", 1)[0].lower()
        if first in ACTION_VERBS:
            strong += 1
    ratio = strong / len(bullets)
    return Check(
        name="Action verbs",
        score=_r(ratio * 10),
        max=10,
        detail=f"{strong} of {len(bullets)} bullets start with an action verb ({round(ratio * 100)}%)",
    )


def score_resume(parsed: ParsedResume, raw_text: str) -> AtsResult:
    checks = [
        _contact(parsed),
        _sections(parsed),
        _quantified(parsed),
        _skills(parsed),
        _length(raw_text),
        _formatting(raw_text),
        _action_verbs(parsed),
    ]
    # total is the sum of the (already-rounded) parts → parts always sum to total.
    total = _r(sum(c.score for c in checks))
    return AtsResult(total=total, checks=checks)
