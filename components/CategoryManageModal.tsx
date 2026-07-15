"use client";

import { useState } from "react";
import type { Category } from "@/lib/db";
import { nextCategoryColor } from "@/lib/format";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";

const COLOR_OPTIONS = ["#3555D8", "#FF6452", "#4C9A6A", "#B8860B", "#8A5CF6", "#DB4E9C"];

export function CategoryManageModal({
  isOpen,
  onClose,
  categories,
  categoryCounts,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}: {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  categoryCounts: Record<string, number>;
  onCreateCategory: (name: string, color: string) => Promise<Category>;
  onUpdateCategory: (id: string, name: string, color: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNameError, setNewNameError] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editNameError, setEditNameError] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const usedCategories = categories.filter((category) => (categoryCounts[category.id] ?? 0) > 0);
  const unusedCategories = categories.filter((category) => (categoryCounts[category.id] ?? 0) === 0);

  const nameCollidesWith = (name: string, excludingId?: string) =>
    categories.some(
      (category) => category.id !== excludingId && category.name.toLowerCase() === name.toLowerCase()
    );

  const startEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditName(category.name);
    setEditColor(category.color);
    setEditNameError(null);
  };

  const saveEdit = async () => {
    if (!editingCategoryId) return;
    const name = editName.trim();
    if (!name) return;
    if (nameCollidesWith(name, editingCategoryId)) {
      setEditNameError("이미 있는 카테고리예요.");
      return;
    }
    await onUpdateCategory(editingCategoryId, name, editColor);
    setEditingCategoryId(null);
  };

  const submitNewCategory = async () => {
    const name = newName.trim();
    if (!name) {
      setIsAddingNew(false);
      return;
    }
    if (nameCollidesWith(name)) {
      setNewNameError("이미 있는 카테고리예요.");
      return;
    }
    await onCreateCategory(name, nextCategoryColor(categories.length));
    setNewName("");
    setIsAddingNew(false);
  };

  const renderCategoryRow = (category: Category) => {
    const isEditing = editingCategoryId === category.id;
    const count = categoryCounts[category.id] ?? 0;

    if (isEditing) {
      return (
        <div key={category.id} className="flex flex-col gap-2 rounded-lg border border-brand/40 p-2">
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={editName}
              onChange={(e) => {
                setEditName(e.target.value);
                if (editNameError) setEditNameError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              className="h-9 flex-1 rounded-md border border-black/15 px-2 text-[14px] outline-none focus:border-brand"
            />
            <Button variant="primary" size="sm" onClick={saveEdit}>
              완료
            </Button>
          </div>
          {editNameError && <p className="text-[12px] text-coral">{editNameError}</p>}
          <div className="flex gap-1.5">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setEditColor(color)}
                style={{ backgroundColor: color }}
                className={`size-5 shrink-0 rounded-full ${editColor === color ? "ring-2 ring-offset-1 ring-ink" : ""}`}
                aria-label={color}
              />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div key={category.id} className="flex items-center gap-2 rounded-lg p-2">
        <span className="size-3.5 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
        <span className="flex-1 truncate text-[14px] text-ink">{category.name}</span>
        <span className="text-[12px] text-gray">({count}개 항목)</span>
        <button
          type="button"
          onClick={() => startEdit(category)}
          className="px-1.5 text-[13px] font-medium text-brand"
        >
          수정
        </button>
        <button
          type="button"
          onClick={() => setDeletingCategory(category)}
          className="px-1.5 text-[13px] font-medium text-coral"
        >
          삭제
        </button>
      </div>
    );
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} widthClassName="max-w-md">
        <h2 className="text-[20px] font-bold text-ink">카테고리 관리</h2>

        <div className="mt-4 flex flex-col gap-2">
          {isAddingNew && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 rounded-lg border border-brand/40 p-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (newNameError) setNewNameError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && submitNewCategory()}
                  placeholder="새 카테고리명"
                  className="h-9 flex-1 rounded-md border border-black/15 px-2 text-[14px] outline-none focus:border-brand"
                />
                <Button variant="primary" size="sm" onClick={submitNewCategory}>
                  추가
                </Button>
              </div>
              {newNameError && <p className="text-[12px] text-coral">{newNameError}</p>}
            </div>
          )}

          {usedCategories.map(renderCategoryRow)}

          {unusedCategories.length > 0 && (
            <>
              <p className="mt-3 mb-1 text-[12px] text-gray">사용하지 않는 카테고리</p>
              {unusedCategories.map(renderCategoryRow)}
            </>
          )}

          {categories.length === 0 && !isAddingNew && (
            <p className="py-6 text-center text-[14px] text-gray">등록된 카테고리가 없어요</p>
          )}
        </div>

        <Button variant="secondary" className="mt-4 w-full" onClick={() => setIsAddingNew(true)}>
          + 새 카테고리 추가
        </Button>
      </Modal>

      <ConfirmDialog
        isOpen={deletingCategory !== null}
        title={`'${deletingCategory?.name}' 카테고리를 삭제할까요?`}
        description={`이 카테고리가 붙은 ${
          deletingCategory ? categoryCounts[deletingCategory.id] ?? 0 : 0
        }개 항목에서도 제거됩니다`}
        onCancel={() => setDeletingCategory(null)}
        onConfirm={async () => {
          if (!deletingCategory) return;
          await onDeleteCategory(deletingCategory.id);
          setDeletingCategory(null);
        }}
        zIndexClassName="z-[60]"
      />
    </>
  );
}
