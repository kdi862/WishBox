"use client";

import type { Tag } from "@/lib/db";
import { Chip } from "./ui/Chip";

export function TagFilterBar({
  tags,
  selectedTagIds,
  onToggleTag,
  onClearFilters,
  onManageTags,
}: {
  tags: Tag[];
  selectedTagIds: string[];
  onToggleTag: (tagId: string) => void;
  onClearFilters: () => void;
  onManageTags: () => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6">
      <Chip selected={selectedTagIds.length === 0} onClick={onClearFilters}>
        전체
      </Chip>
      {tags.map((tag) => (
        <Chip
          key={tag.id}
          selected={selectedTagIds.includes(tag.id)}
          color={tag.color}
          onClick={() => onToggleTag(tag.id)}
        >
          {tag.name}
        </Chip>
      ))}
      <Chip onClick={onManageTags} className="border-dashed text-gray">
        + 태그관리
      </Chip>
    </div>
  );
}
