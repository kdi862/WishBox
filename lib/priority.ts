export type PriorityQuadrant =
  | "instant_buy"
  | "essential"
  | "wishlist_hold"
  | "exclude_candidate";

export const QUADRANT_LABEL: Record<PriorityQuadrant, string> = {
  instant_buy: "지금 사요",
  essential: "꼭 필요해요",
  wishlist_hold: "천천히 사도 돼요",
  exclude_candidate: "다시 생각해봐요",
};

const HIGH_THRESHOLD = 4;

export function getQuadrant(needScore: number, wantScore: number): PriorityQuadrant {
  const needHigh = needScore >= HIGH_THRESHOLD;
  const wantHigh = wantScore >= HIGH_THRESHOLD;

  if (needHigh && wantHigh) return "instant_buy";
  if (needHigh && !wantHigh) return "essential";
  if (!needHigh && wantHigh) return "wishlist_hold";
  return "exclude_candidate";
}

export const SCORE_LABELS = ["전혀", "조금", "보통", "꽤", "매우"];

const PRIORITY_COLORS = ["#4C9A6A", "#8BAE4E", "#E0B23D", "#E08E45", "#FF6452"];

export function priorityColor(score: number): string {
  const index = Math.min(5, Math.max(1, Math.round(score))) - 1;
  return PRIORITY_COLORS[index];
}
