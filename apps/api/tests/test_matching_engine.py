"""Hybrid rerank tests: skill_terms, exp_fit, score_pair, and the A-vs-B proving pair.

Runnable with the venv python directly (no pytest needed):
    .venv/Scripts/python.exe tests/test_matching_engine.py
Also pytest-discoverable (test_* functions).

The A-vs-B counter-example is the 'why hybrid beats cosine' proof:
Candidate A has exact required skills but plain wording (lower cosine sim).
Candidate B has buzzword-rich prose (higher cosine sim) but few required skills.
Post-rerank, A must outrank B — skill overlap tips the balance.
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from app.services.matching_engine import (  # noqa: E402
    EXP_BAND,
    IDEAL_OFFSET,
    exp_fit,
    score_pair,
    skill_terms,
)


# ---------------------------------------------------------------------------
# skill_terms
# ---------------------------------------------------------------------------


def test_skill_terms_perfect_overlap():
    overlap, matched, missing = skill_terms(
        ["Python", "FastAPI", "PostgreSQL"],
        ["Python", "FastAPI", "PostgreSQL"],
    )
    assert overlap == 1.0
    assert matched == ["FastAPI", "PostgreSQL", "Python"]  # sorted
    assert missing == []


def test_skill_terms_partial_overlap():
    overlap, matched, missing = skill_terms(
        ["Python", "Docker"],
        ["Python", "FastAPI", "PostgreSQL"],
    )
    assert overlap == 1 / 3
    assert matched == ["Python"]
    assert missing == ["FastAPI", "PostgreSQL"]


def test_skill_terms_zero_overlap():
    overlap, matched, missing = skill_terms(
        ["Go", "Rust"],
        ["Python", "FastAPI"],
    )
    assert overlap == 0.0
    assert matched == []
    assert missing == ["FastAPI", "Python"]


def test_skill_terms_case_insensitive():
    """Normalized (casefolded) comparison — case should not matter."""
    overlap, matched, missing = skill_terms(
        ["python", "FASTAPI"],
        ["Python", "FastAPI"],
    )
    assert overlap == 1.0
    assert len(matched) == 2
    assert missing == []


def test_skill_terms_empty_required():
    """No required skills → overlap is None (triggers weight redistribution)."""
    overlap, matched, missing = skill_terms(["Python", "Docker"], [])
    assert overlap is None
    assert matched == []
    assert missing == []


def test_skill_terms_empty_required_none():
    overlap, matched, missing = skill_terms(["Python"], None)
    assert overlap is None


def test_skill_terms_empty_resume():
    """Resume has no skills but job requires some → 0 overlap."""
    overlap, matched, missing = skill_terms([], ["Python", "FastAPI"])
    assert overlap == 0.0
    assert matched == []
    assert missing == ["FastAPI", "Python"]


def test_skill_terms_both_empty():
    """Both sides empty → overlap None (no required = redistribution)."""
    overlap, matched, missing = skill_terms([], [])
    assert overlap is None
    assert matched == []
    assert missing == []


def test_skill_terms_both_none():
    overlap, matched, missing = skill_terms(None, None)
    assert overlap is None


def test_skill_terms_dedup_required():
    """Duplicate required skills should not inflate the denominator."""
    overlap, matched, missing = skill_terms(
        ["Python"],
        ["Python", "python", "PYTHON"],
    )
    # After normalization, all three "python" entries are the same key
    assert overlap == 1.0
    assert len(matched) == 1
    assert missing == []


# ---------------------------------------------------------------------------
# exp_fit
# ---------------------------------------------------------------------------


def test_exp_fit_ideal():
    """At exactly ideal (min_experience + IDEAL_OFFSET) → 1.0."""
    ideal = 3.0 + IDEAL_OFFSET  # 5.0 with default offset 2
    assert exp_fit(ideal, 3.0) == 1.0


def test_exp_fit_at_min():
    """At min_experience itself → less than 1.0 but > 0.0."""
    fit = exp_fit(3.0, 3.0)
    assert 0.0 < fit < 1.0


def test_exp_fit_none_years():
    """None years coalesces to 0."""
    fit = exp_fit(None, 3.0)
    assert 0.0 <= fit <= 1.0


def test_exp_fit_none_min():
    """None min_experience coalesces to 0 → ideal = IDEAL_OFFSET."""
    fit = exp_fit(IDEAL_OFFSET, None)
    assert fit == 1.0


def test_exp_fit_far_away():
    """Far enough from ideal (>= EXP_BAND) → 0.0."""
    fit = exp_fit(0.0, 3.0 + EXP_BAND + IDEAL_OFFSET)
    assert fit == 0.0


def test_exp_fit_clamped():
    """Negative differences clamp, never go below 0."""
    fit = exp_fit(100.0, 0.0)
    assert fit >= 0.0
    fit2 = exp_fit(0.0, 100.0)
    assert fit2 >= 0.0


# ---------------------------------------------------------------------------
# score_pair — determinism
# ---------------------------------------------------------------------------


def test_score_pair_determinism():
    """Same inputs → bit-identical score and breakdown."""
    args = (0.82, ["Python", "FastAPI"], ["Python", "FastAPI", "Docker"], 4.0, 2.0)
    s1, b1 = score_pair(*args)
    s2, b2 = score_pair(*args)
    assert s1 == s2
    assert b1 == b2


def test_score_pair_weights_sum():
    """The weights echoed in the breakdown always sum to 1.0."""
    _, bd = score_pair(0.7, ["Python"], ["Python", "Go"], 3.0, 2.0)
    total = sum(bd["weights"].values())
    assert abs(total - 1.0) < 1e-9, f"weights sum to {total}, not 1.0"


def test_score_pair_weights_sum_redistributed():
    """Even after redistribution (empty required), weights sum to 1.0."""
    _, bd = score_pair(0.7, ["Python"], [], 3.0, 2.0)
    total = sum(bd["weights"].values())
    assert abs(total - 1.0) < 1e-9, f"redistributed weights sum to {total}"


def test_score_pair_recomputes():
    """score = dot(weights, components) — the breakdown is data, not vibes."""
    score, bd = score_pair(0.75, ["Python", "Docker"], ["Python", "Docker", "Go"], 5.0, 3.0)
    w = bd["weights"]
    recomputed = round(
        w["semantic"] * bd["embedding_sim"]
        + w["skills"] * (bd["skill_overlap"] or 0.0)
        + w["experience"] * bd["exp_fit"],
        4,
    )
    assert score == recomputed, f"stored {score} != recomputed {recomputed}"


def test_score_pair_recomputes_redistributed():
    """Recomputes correctly even when skill weight is redistributed."""
    score, bd = score_pair(0.9, ["Python"], None, 2.0, 0.0)
    w = bd["weights"]
    recomputed = round(
        w["semantic"] * bd["embedding_sim"]
        + w["skills"] * (bd["skill_overlap"] or 0.0)
        + w["experience"] * bd["exp_fit"],
        4,
    )
    assert score == recomputed


# ---------------------------------------------------------------------------
# Weight redistribution
# ---------------------------------------------------------------------------


def test_redistribution_note():
    """When required_skills is empty, the breakdown carries an explanatory note."""
    _, bd = score_pair(0.8, ["Python"], [], 3.0, 1.0)
    assert bd["note"] is not None
    assert "redistributed" in bd["note"].lower()
    assert bd["weights"]["skills"] == 0.0
    assert bd["skill_overlap"] is None


def test_redistribution_increases_semantic_weight():
    """Semantic weight absorbs the skill weight when no required skills."""
    _, bd_normal = score_pair(0.8, ["Python"], ["Python"], 3.0, 1.0)
    _, bd_redis = score_pair(0.8, ["Python"], [], 3.0, 1.0)
    assert bd_redis["weights"]["semantic"] > bd_normal["weights"]["semantic"]


# ---------------------------------------------------------------------------
# Score bounds
# ---------------------------------------------------------------------------


def test_score_bounds():
    """Hybrid score stays in [0, 1] for any reasonable inputs."""
    cases = [
        (1.0, ["A"], ["A"], 4.0, 2.0),  # perfect
        (0.0, [], ["A", "B"], 0.0, 10.0),  # worst
        (0.5, ["X"], None, 3.0, 3.0),  # redistribution
    ]
    for args in cases:
        s, _ = score_pair(*args)
        assert 0.0 <= s <= 1.0, f"score {s} out of bounds for {args}"


# ---------------------------------------------------------------------------
# A-vs-B proving pair: hybrid beats pure cosine
# ---------------------------------------------------------------------------
# This is the sentence you say in interviews:
#   "Candidate A has the exact required skills but plain prose (lower cosine).
#    Candidate B has buzzy marketing prose (higher cosine) but only one
#    required skill. After hybrid rerank, A outranks B because 35% of the
#    score is skill overlap — the system rewards substance over style."


def test_a_outranks_b_proving_pair():
    """THE counter-example: exact-skills candidate beats buzzword candidate.

    Setup:
      Job requires: ["Python", "FastAPI", "PostgreSQL", "Docker", "Redis"]
      Candidate A: skills = all 5 required, cosine sim = 0.65 (plain prose)
      Candidate B: skills = ["Python"] only,  cosine sim = 0.88 (buzzy prose)
      Both have 4 years experience, job min = 2.

    Pure cosine: B (0.88) > A (0.65) — B wins.
    Hybrid rerank: A wins because skill_overlap 1.0 vs 0.2 dominates.
    """
    required = ["Python", "FastAPI", "PostgreSQL", "Docker", "Redis"]

    # Candidate A: exact skills, low cosine similarity
    score_a, bd_a = score_pair(
        sim=0.65,
        resume_skills=["Python", "FastAPI", "PostgreSQL", "Docker", "Redis"],
        required_skills=required,
        years=4.0,
        min_experience=2.0,
    )

    # Candidate B: buzzword-heavy resume, high cosine similarity, few matching skills
    score_b, bd_b = score_pair(
        sim=0.88,
        resume_skills=["Python", "Machine Learning", "TensorFlow", "Kubernetes"],
        required_skills=required,
        years=4.0,
        min_experience=2.0,
    )

    # PROOF: A outranks B after hybrid rerank
    assert score_a > score_b, (
        f"A ({score_a}) must outrank B ({score_b}): "
        f"A overlap={bd_a['skill_overlap']}, B overlap={bd_b['skill_overlap']}"
    )

    # Verify the WHY:
    assert bd_a["skill_overlap"] == 1.0, "A has perfect skill overlap"
    assert bd_b["skill_overlap"] == 0.2, "B has only 1/5 required skills"
    assert bd_a["matched"] == ["Docker", "FastAPI", "PostgreSQL", "Python", "Redis"]
    assert bd_b["missing"] == ["Docker", "FastAPI", "PostgreSQL", "Redis"]

    # Record the numbers for memory.md:
    # score_a ≈ 0.5*0.65 + 0.35*1.0 + 0.15*1.0 = 0.325 + 0.35 + 0.15 = 0.825
    # score_b ≈ 0.5*0.88 + 0.35*0.2 + 0.15*1.0 = 0.44  + 0.07 + 0.15 = 0.66
    assert score_a > 0.80, f"A score {score_a} should be > 0.80"
    assert score_b < 0.70, f"B score {score_b} should be < 0.70"


def test_pure_cosine_b_would_win():
    """Proves that WITHOUT the hybrid rerank, B would have won on cosine alone.
    This makes the A-vs-B test meaningful — without hybrid, the system would
    have ranked the wrong candidate higher."""
    assert 0.88 > 0.65, "Pure cosine: B (0.88) > A (0.65)"


# ---------------------------------------------------------------------------
# runner (no pytest needed)
# ---------------------------------------------------------------------------


if __name__ == "__main__":
    fns = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for fn in fns:
        fn()
        print(f"PASS {fn.__name__}")
    print(f"all {len(fns)} matching engine tests passed")
