"use client";

import { useEffect, useRef, useState } from "react";
import type { Category, WishItem } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { QUADRANT_LABEL, getQuadrant } from "@/lib/priority";
import { CategoryDefaultIcon, LinkIcon, XIcon } from "./icons";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import { PriorityLevel } from "./ui/PriorityLevel";

const DEFAULT_IMAGE_BOX_SIZE = 96;

export function ItemDetailModal({
  item,
  categories,
  onClose,
  onEdit,
  onDelete,
}: {
  item: WishItem | null;
  categories: Category[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const infoColumnRef = useRef<HTMLDivElement>(null);
  const [imageBoxSize, setImageBoxSize] = useState(DEFAULT_IMAGE_BOX_SIZE);

  useEffect(() => {
    const el = infoColumnRef.current;
    if (!item || !el) return;

    const updateSize = () => setImageBoxSize(el.offsetHeight);
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [item]);

  return (
    <Modal isOpen={item !== null} onClose={onClose} widthClassName="max-w-md">
      {item && (
        <>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-[20px] font-bold text-ink">{item.title}</h2>
            <button type="button" onClick={onClose} aria-label="닫기" className="shrink-0 text-gray">
              <XIcon className="size-5" />
            </button>
          </div>

          <div className="mt-4 flex gap-4">
            <div
              className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/5"
              style={{ width: imageBoxSize, height: imageBoxSize }}
            >
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
              ) : (
                <CategoryDefaultIcon
                  className="size-8"
                  style={categories[0] ? { color: categories[0].color } : undefined}
                />
              )}
            </div>
            <div ref={infoColumnRef} className="flex flex-1 flex-col justify-center gap-2.5">
              <div className="flex flex-col gap-2">
                <p className="text-[16px] font-semibold text-ink">{formatPrice(item.price)}</p>
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((category) => (
                      <span
                        key={category.id}
                        className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 border-t border-black/10 pt-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-9 shrink-0 text-[12px] text-gray">필요도</span>
                  <PriorityLevel score={item.need_score} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-9 shrink-0 text-[12px] text-gray">만족도</span>
                  <PriorityLevel score={item.want_score} />
                </div>
                <span className="mt-0.5 text-[12px] text-gray">
                  {QUADRANT_LABEL[getQuadrant(item.need_score, item.want_score)]}
                </span>
              </div>
            </div>
          </div>

          {item.memo && (
            <p className="mt-4 whitespace-pre-wrap rounded-lg bg-black/[.03] p-3 text-[14px] leading-relaxed text-ink">
              {item.memo}
            </p>
          )}

          <div className="mt-4">
            {item.purchase_link ? (
              <a
                href={item.purchase_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center justify-center gap-1.5 rounded-lg border border-brand text-[15px] font-medium text-brand transition-colors hover:bg-brand/5"
              >
                <LinkIcon className="size-4" />
                구매 링크 바로가기
              </a>
            ) : (
              <div className="flex h-11 items-center justify-center rounded-lg border border-black/10 text-[13px] text-gray">
                등록된 구매 링크가 없어요
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between gap-2">
            <button type="button" onClick={onDelete} className="px-1.5 text-[14px] font-medium text-coral">
              삭제
            </button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose}>
                닫기
              </Button>
              <Button variant="primary" onClick={onEdit}>
                수정
              </Button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
