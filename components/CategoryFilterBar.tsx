"use client";

import type { Category } from "@/lib/db";
import { Chip } from "./ui/Chip";

export function CategoryFilterBar({
  categories,
  selectedCategoryIds,
  onToggleCategory,
  onClearFilters,
  onManageCategories,
}: {
  categories: Category[];
  selectedCategoryIds: string[];
  onToggleCategory: (categoryId: string) => void;
  onClearFilters: () => void;
  onManageCategories: () => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6">
      <Chip selected={selectedCategoryIds.length === 0} onClick={onClearFilters}>
        전체
      </Chip>
      {categories.map((category) => (
        <Chip
          key={category.id}
          selected={selectedCategoryIds.includes(category.id)}
          color={category.color}
          onClick={() => onToggleCategory(category.id)}
        >
          {category.name}
        </Chip>
      ))}
      <Chip onClick={onManageCategories} className="border-dashed text-gray">
        + 카테고리 관리
      </Chip>
    </div>
  );
}
