"use client";

import type { Tag, WishItem } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { QUADRANT_LABEL, getQuadrant } from "@/lib/priority";
import { LinkIcon, TagDefaultIcon, XIcon } from "./icons";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import { PriorityStars } from "./ui/PriorityStars";

export function ItemDetailModal({
  item,
  tags,
  onClose,
  onEdit,
  onDelete,
}: {
  item: WishItem | null;
  tags: Tag[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
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
            <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/5">
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image_url} alt={item.title} className="size-24 object-cover" />
              ) : (
                <TagDefaultIcon
                  className="size-8"
                  style={tags[0] ? { color: tags[0].color } : undefined}
                />
              )}
            </div>
            <div className="flex flex-1 flex-col justify-center gap-2">
              <p className="text-[16px] font-semibold text-ink">{formatPrice(item.price)}</p>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <PriorityStars score={item.priority_score} />
                <span className="text-[12px] text-gray">
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

          {item.purchase_link ? (
            <a
              href={item.purchase_link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex h-11 items-center justify-center gap-1.5 rounded-lg border border-brand text-[15px] font-medium text-brand transition-colors hover:bg-brand/5"
            >
              <LinkIcon className="size-4" />
              구매 링크 바로가기
            </a>
          ) : (
            <p className="mt-4 text-center text-[13px] text-gray">등록된 구매 링크가 없어요</p>
          )}

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
