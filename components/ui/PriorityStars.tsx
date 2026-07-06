import { StarIcon } from "../icons";

export function PriorityStars({ score, className = "size-3.5" }: { score: number; className?: string }) {
  const filledCount = Math.round(score);
  return (
    <div className="flex items-center gap-0.5" aria-label={`우선순위 ${score.toFixed(1)}점`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} filled={i < filledCount} className={className} />
      ))}
    </div>
  );
}
