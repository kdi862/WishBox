"use client";

import type { ReactNode } from "react";

export function Chip({
  children,
  selected = false,
  onClick,
  color,
  className = "",
}: {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  color?: string;
  className?: string;
}) {
  const isInteractive = typeof onClick === "function";
  const style = selected && color ? { backgroundColor: color, borderColor: color } : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isInteractive}
      style={style}
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ${
        selected
          ? "border-brand bg-brand text-white"
          : "border-black/10 bg-card text-ink"
      } ${className}`}
    >
      {children}
    </button>
  );
}
