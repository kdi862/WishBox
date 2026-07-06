"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { Tag, WishItem } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { TagDefaultIcon, TrashIcon } from "./icons";
import { Checkbox } from "./ui/Checkbox";
import { PriorityStars } from "./ui/PriorityStars";

const REVEAL_WIDTH = 76;
const LONG_PRESS_MS = 500;
const DRAG_THRESHOLD = 8;

export function ItemCard({
  item,
  tags,
  isFading,
  onToggle,
  onRequestDelete,
  onClick,
}: {
  item: WishItem;
  tags: Tag[];
  isFading: boolean;
  onToggle: () => void;
  onRequestDelete: () => void;
  onClick: () => void;
}) {
  const [translateX, setTranslateX] = useState(0);
  const dragState = useRef<{ startX: number; moved: boolean } | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const revealed = translateX < -REVEAL_WIDTH / 2;

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePointerDown = (e: ReactPointerEvent) => {
    if (revealed) return;
    dragState.current = { startX: e.clientX, moved: false };
    longPressTimer.current = setTimeout(() => {
      if (dragState.current && !dragState.current.moved) {
        setTranslateX(-REVEAL_WIDTH);
      }
    }, LONG_PRESS_MS);
  };

  const handlePointerMove = (e: ReactPointerEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    if (Math.abs(dx) > DRAG_THRESHOLD) {
      dragState.current.moved = true;
      clearLongPress();
      setTranslateX(Math.min(0, Math.max(-REVEAL_WIDTH, dx)));
    }
  };

  const handlePointerUp = () => {
    clearLongPress();
    if (dragState.current?.moved) {
      setTranslateX((current) => (current < -REVEAL_WIDTH / 2 ? -REVEAL_WIDTH : 0));
    }
    dragState.current = null;
  };

  const handleCardClick = () => {
    if (revealed) {
      setTranslateX(0);
      return;
    }
    if (!dragState.current?.moved) onClick();
  };

  const itemTagColor = tags[0]?.color;

  return (
    <div className="relative overflow-hidden rounded-xl">
      <button
        type="button"
        onClick={onRequestDelete}
        aria-label="삭제"
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-coral text-white"
        style={{ width: REVEAL_WIDTH }}
      >
        <TrashIcon className="size-5" />
      </button>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleCardClick}
        style={{ transform: `translateX(${translateX}px)` }}
        className={`relative flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm transition-[transform,opacity] duration-300 select-none touch-pan-y ${
          isFading ? "opacity-30" : "opacity-100"
        }`}
      >
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/5">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.title}
              width={56}
              height={56}
              unoptimized
              className="size-14 object-cover"
            />
          ) : (
            <TagDefaultIcon className="size-6" style={itemTagColor ? { color: itemTagColor } : undefined} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium text-ink">{item.title}</p>
          <div className="mt-1 flex items-center gap-1.5">
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
            <span className="text-[13px] text-gray">{formatPrice(item.price)}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <PriorityStars score={item.priority_score} />
          <Checkbox checked={item.is_purchased} onChange={onToggle} aria-label="구매 완료 체크" />
        </div>
      </div>
    </div>
  );
}
