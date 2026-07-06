import { QUADRANT_LABEL, getQuadrant, type PriorityQuadrant } from "@/lib/priority";

const CELLS: { quadrant: PriorityQuadrant; row: 0 | 1; col: 0 | 1 }[] = [
  { quadrant: "wishlist_hold", row: 0, col: 0 },
  { quadrant: "instant_buy", row: 0, col: 1 },
  { quadrant: "exclude_candidate", row: 1, col: 0 },
  { quadrant: "essential", row: 1, col: 1 },
];

export function PriorityMatrixPreview({ needScore, wantScore }: { needScore: number; wantScore: number }) {
  const activeQuadrant = getQuadrant(needScore, wantScore);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-col items-center gap-1">
        <div className="relative">
          <span className="absolute right-full top-1/2 mr-1 -translate-y-1/2 text-[11px] text-gray [text-orientation:upright] [writing-mode:vertical-rl]">
            ↑욕구
          </span>
          <div className="grid w-44 grid-cols-2 grid-rows-2 gap-1.5">
            {CELLS.map(({ quadrant, row, col }) => (
              <div
                key={quadrant}
                className={`flex aspect-square items-center justify-center whitespace-nowrap rounded-md px-1.5 text-center text-[11px] leading-tight ${
                  quadrant === activeQuadrant
                    ? "bg-coral text-white font-semibold"
                    : "bg-black/5 text-gray"
                }`}
                style={{ gridRow: row + 1, gridColumn: col + 1 }}
              >
                {QUADRANT_LABEL[quadrant]}
              </div>
            ))}
          </div>
        </div>
        <span className="text-[11px] text-gray">필요도 →</span>
      </div>
      <p className="text-center text-[13px] text-gray">
        이 항목은{" "}
        <span className="text-[15px] font-semibold text-ink">{QUADRANT_LABEL[activeQuadrant]}</span>
      </p>
    </div>
  );
}
