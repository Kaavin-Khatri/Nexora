"""Determinism + correctness tests for the ATS scorer.

Runnable with the venv python directly (no pytest needed):
    .venv/Scripts/python.exe tests/test_ats_scorer.py
Also pytest-discoverable (test_* functions).

The golden totals below are PINNED: if the scorer's output changes, these fail —
which is the point. The same resume must always score the same.
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from app.schemas.resume_parsed import Contact, Education, Experience, ParsedResume  # noqa: E402
from app.services.ats_scorer import score_resume  # noqa: E402

# realistic, clean multi-line resume text: >300 words, long lines, no artifacts
STRONG_RAW = "\n".join(
    [
        "Ananya Sharma - Senior Backend Engineer based in Ahmedabad, India.",
        "Backend engineer with five years building payment infrastructure and "
        "reconciliation pipelines for fintech merchants across India.",
        "Skilled in Python, FastAPI and PostgreSQL with a focus on correctness under load.",
    ]
    + [
        "Delivered reliable settlement and payout systems while reducing operational "
        "toil and improving observability for the on-call team every quarter."
    ]
    * 20
)

STRONG = ParsedResume(
    contact=Contact(
        name="Ananya Sharma", email="a@x.com", phone="+91 98765 43210", location="Ahmedabad"
    ),
    summary="Backend engineer with 5 years in fintech payments.",
    skills=[
        "Python",
        "FastAPI",
        "PostgreSQL",
        "Docker",
        "AWS",
        "REST APIs",
        "Redis",
        "SQL",
        "Kafka",
        "Git",
    ],
    experience=[
        Experience(
            title="Senior Backend Engineer",
            company="PayOrbit",
            start="2022",
            current=True,
            bullets=[
                "Built settlement service handling 2M+ daily transactions",
                "Reduced reconciliation errors by 40%",
                "Led migration of 12 services to FastAPI",
            ],
        ),
        Experience(
            title="Backend Engineer",
            company="FinStack",
            start="2019",
            end="2021",
            bullets=[
                "Designed payouts API serving 500 merchants",
                "Improved webhook delivery reliability to 99.9%",
            ],
        ),
    ],
    education=[Education(degree="B.Tech Computer Engineering", institution="Nirma", year="2019")],
    certifications=["AWS Certified Solutions Architect"],
    total_years_estimate=5.0,
)

WEAK_RAW = "\n".join(
    ["Ravi Patel", "Objective: junior analyst role."]
    + ["Comfortable with SQL and spreadsheets and eager to learn new tools."] * 6
)
WEAK = ParsedResume(
    contact=Contact(name="Ravi Patel", email="r@x.com"),
    summary=None,
    skills=["SQL", "Excel"],
    experience=[
        Experience(
            title="Intern",
            company="Club",
            bullets=["Helped build dashboards", "Assisted the team with tasks"],
        )
    ],
    education=[Education(degree="B.Com")],
    certifications=[],
)

EMPTY = ParsedResume()
EMPTY_RAW = "short text"

# PINNED golden totals (discovered from the deterministic scorer).
GOLDEN = {"strong": 100.0, "weak": 37.15, "empty": 4.07}


def test_determinism():
    for p, raw in [(STRONG, STRONG_RAW), (WEAK, WEAK_RAW), (EMPTY, EMPTY_RAW)]:
        a = score_resume(p, raw).total
        b = score_resume(p, raw).total
        assert a == b, f"non-deterministic: {a} != {b}"


def test_golden_totals():
    assert score_resume(STRONG, STRONG_RAW).total == GOLDEN["strong"]
    assert score_resume(WEAK, WEAK_RAW).total == GOLDEN["weak"]
    assert score_resume(EMPTY, EMPTY_RAW).total == GOLDEN["empty"]


def test_parts_sum_to_total():
    for p, raw in [(STRONG, STRONG_RAW), (WEAK, WEAK_RAW), (EMPTY, EMPTY_RAW)]:
        r = score_resume(p, raw)
        assert round(sum(c.score for c in r.checks), 2) == r.total


def test_monotonic():
    s = score_resume(STRONG, STRONG_RAW).total
    w = score_resume(WEAK, WEAK_RAW).total
    e = score_resume(EMPTY, EMPTY_RAW).total
    assert s > w > e, f"expected strong>weak>empty, got {s},{w},{e}"


def test_bounds_and_no_crash():
    for p, raw in [(STRONG, STRONG_RAW), (WEAK, WEAK_RAW), (EMPTY, EMPTY_RAW)]:
        r = score_resume(p, raw)
        assert 0 <= r.total <= 100
        for c in r.checks:
            assert 0 <= c.score <= c.max
    # near-empty scores low without crashing
    assert score_resume(EMPTY, EMPTY_RAW).total < 15


if __name__ == "__main__":
    fns = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for fn in fns:
        fn()
        print(f"PASS {fn.__name__}")
    print("all ATS scorer tests passed")
