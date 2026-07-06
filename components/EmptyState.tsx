import { Button } from "./ui/Button";

type Variant = "no-items" | "no-purchased" | "filtered-empty";

const COPY: Record<Variant, { title: string; subtitle?: string }> = {
  "no-items": {
    title: "아직 담아둔 게 없어요",
    subtitle: "사고 싶은 걸 지금 추가해보세요.",
  },
  "no-purchased": {
    title: "아직 산 게 없어요",
    subtitle: "체크하면 여기 모여요.",
  },
  "filtered-empty": {
    title: "이 조건에 맞는 항목이 없어요",
  },
};

export function EmptyState({
  variant,
  onPrimaryAction,
}: {
  variant: Variant;
  onPrimaryAction: () => void;
}) {
  const copy = COPY[variant];

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <p className="text-[16px] font-semibold text-ink">{copy.title}</p>
      {copy.subtitle && <p className="text-[14px] text-gray">{copy.subtitle}</p>}
      {variant === "no-items" && (
        <Button variant="primary" className="mt-2" onClick={onPrimaryAction}>
          + 새 항목
        </Button>
      )}
      {variant === "filtered-empty" && (
        <Button variant="secondary" className="mt-2" onClick={onPrimaryAction}>
          필터 초기화
        </Button>
      )}
    </div>
  );
}
