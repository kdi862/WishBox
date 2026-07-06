"use client";

export function Checkbox({
  checked,
  onChange,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  onChange: () => void;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className={`flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
        checked ? "border-brand bg-brand" : "border-black/25 bg-transparent"
      }`}
    >
      {checked && (
        <svg viewBox="0 0 24 24" className="size-3" fill="none" aria-hidden>
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="white"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
