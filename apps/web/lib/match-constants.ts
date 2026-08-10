/**
 * Match tier thresholds and component tooltips — the SINGLE source for match
 * display constants. Tier boundaries are defined once here and consumed by
 * MatchScoreCard (and any future surface that shows match quality).
 *
 * Rule: breakdown values are RENDER-ONLY on the client, never recomputed.
 */

// ---------------------------------------------------------------------------
// Tier thresholds (score is 0-1 from the API; percentages are score * 100)
// ---------------------------------------------------------------------------

export const MATCH_TIERS = [
  { min: 75, label: "Strong match", className: "text-success" },
  { min: 55, label: "Good match", className: "text-primary" },
  { min: 0, label: "Partial match", className: "text-warning" },
] as const;

export type MatchTier = (typeof MATCH_TIERS)[number];

/** Returns the tier for a 0-1 score. */
export function getMatchTier(score: number): MatchTier {
  const pct = Math.round(score * 100);
  return MATCH_TIERS.find((t) => pct >= t.min) ?? MATCH_TIERS[MATCH_TIERS.length - 1];
}

// ---------------------------------------------------------------------------
// Component bar definitions (order matters: semantic first)
// ---------------------------------------------------------------------------

export type ScoreComponent = {
  key: "embedding_sim" | "skill_overlap" | "exp_fit";
  label: string;
  tooltip: string;
  colorClass: string;
  weightKey: "semantic" | "skills" | "experience";
};

export const SCORE_COMPONENTS: ScoreComponent[] = [
  {
    key: "embedding_sim",
    label: "Semantic fit",
    tooltip:
      "How closely the overall experience and background read against this role — based on the meaning of the text, not just keyword matches.",
    colorClass: "bg-primary",
    weightKey: "semantic",
  },
  {
    key: "skill_overlap",
    label: "Skills overlap",
    tooltip:
      "How many of the required skills are present — the fraction of listed requirements that appear in the resume or profile.",
    colorClass: "bg-accent-2",
    weightKey: "skills",
  },
  {
    key: "exp_fit",
    label: "Experience fit",
    tooltip:
      "How well the years of experience match what this role expects — closest to full marks at the ideal seniority level.",
    colorClass: "bg-success",
    weightKey: "experience",
  },
];
