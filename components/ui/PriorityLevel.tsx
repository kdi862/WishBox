import { SCORE_LABELS, priorityColor } from "@/lib/priority";

export function PriorityLevel({ score, className = "text-[12px]" }: { score: number; className?: string }) {
  return (
    <span className={`font-semibold ${className}`} style={{ color: priorityColor(score) }}>
      {SCORE_LABELS[Math.min(5, Math.max(1, Math.round(score))) - 1]}
    </span>
  );
}
